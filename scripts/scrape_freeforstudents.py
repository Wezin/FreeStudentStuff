#!/usr/bin/env python3
"""Generic site crawler + extractor for freeforstudents.org/us.

This script crawls the target site, collects candidate deal blocks, and
outputs a normalized JSON file that matches the FreeStudentStuff listing schema.
"""

import json
import re
import sys
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

START_URL = "https://freeforstudents.org/us"
MAX_PAGES = 25
OUTPUT_FILE = "freeforstudents_deals.json"
USER_AGENT = "Mozilla/5.0 (compatible; GenericScraper/1.0)"


class SimpleNode:
    def __init__(self, tag=None, attrs=None, parent=None):
        self.tag = tag
        self.attrs = dict(attrs or [])
        self.children = []
        self.data = ""
        self.parent = parent

    def text(self):
        inner = self.data or ""
        for child in self.children:
            inner += child.text()
        return re.sub(r"\s+", " ", inner).strip()

    def find_all(self, tag=None, class_contains=None):
        nodes = []
        if tag is None or self.tag == tag:
            if class_contains is None or class_contains in self.attrs.get("class", ""):
                nodes.append(self)
        for child in self.children:
            nodes.extend(child.find_all(tag=tag, class_contains=class_contains))
        return nodes

    def __repr__(self):
        return f"SimpleNode(tag={self.tag!r}, attrs={self.attrs!r})"


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root = SimpleNode(tag="document")
        self.current = self.root

    def handle_starttag(self, tag, attrs):
        node = SimpleNode(tag=tag, attrs=attrs, parent=self.current)
        self.current.children.append(node)
        self.current = node

    def handle_endtag(self, tag):
        if self.current.parent is not None:
            self.current = self.current.parent

    def handle_data(self, data):
        if data.strip():
            self.current.data += data


def fetch_url(url):
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=30) as response:
        content_type = response.headers.get("Content-Type", "")
        if "charset=" in content_type:
            charset = content_type.split("charset=")[-1].split(";")[0].strip()
        else:
            charset = "utf-8"
        raw = response.read()
        return raw.decode(charset, errors="replace")


def normalize_url(base, target):
    if not target:
        return None
    return urljoin(base, target.strip())


def is_internal_link(base_url, href):
    if not href:
        return False
    href = urljoin(base_url, href)
    parsed_base = urlparse(base_url)
    parsed_target = urlparse(href)
    return parsed_target.netloc == parsed_base.netloc and parsed_target.scheme in ("http", "https")


def extract_links(html, base_url):
    hrefs = set()
    for match in re.finditer(r"<a[^>]+href=['\"]([^'\"]+)['\"]", html, flags=re.I):
        href = normalize_url(base_url, match.group(1))
        if href and is_internal_link(base_url, href):
            hrefs.add(href.split("#")[0])
    return list(hrefs)


def parse_html(html):
    builder = TreeBuilder()
    builder.feed(html)
    return builder.root


def candidate_blocks(root):
    blocks = []
    for tag in ("article", "section", "main", "div"):
        blocks.extend(root.find_all(tag=tag, class_contains="card"))
        blocks.extend(root.find_all(tag=tag, class_contains="deal"))
        blocks.extend(root.find_all(tag=tag, class_contains="promo"))
    if not blocks:
        blocks.extend(root.find_all(tag="article"))
        blocks.extend(root.find_all(tag="section"))
    return blocks


def extract_deal_data(node, page_url):
    anchors = node.find_all(tag="a")
    images = node.find_all(tag="img")
    headings = []
    for level in ("h1", "h2", "h3", "h4", "h5", "strong", "b"):
        headings.extend(node.find_all(tag=level))
    title = None
    if headings:
        title = headings[0].text()
    elif anchors:
        title = anchors[0].text()
    description = None
    paragraphs = node.find_all(tag="p")
    if paragraphs:
        description = paragraphs[0].text()
    elif len(anchors) > 1:
        description = anchors[1].text()
    if not title and not description:
        title = node.text()
    source_url = None
    for a in anchors:
        href = a.attrs.get("href")
        if href and href.startswith("http"):
            source_url = normalize_url(page_url, href)
            break
    if not source_url and anchors:
        source_url = normalize_url(page_url, anchors[0].attrs.get("href", ""))
    thumbnail_url = None
    if images:
        thumbnail_url = normalize_url(page_url, images[0].attrs.get("src", ""))
    tags = []
    for cls in node.attrs.get("class", "").split():
        if cls and not cls.isnumeric():
            tags.append(cls)
    if not tags:
        for child in node.find_all(tag="span"):
            if "tag" in child.attrs.get("class", "") or "label" in child.attrs.get("class", ""):
                tags.append(child.text())
    if title:
        title = re.sub(r"\s+", " ", title).strip()
    if description:
        description = re.sub(r"\s+", " ", description).strip()
    if title and not source_url:
        return None
    deal = {
        "title": title or "",
        "description": description or title or "",
        "listing_type": "deal",
        "location": None,
        "starts_at": None,
        "ends_at": None,
        "tags": tags,
        "thumbnail_url": thumbnail_url or "",
        "source_url": source_url or page_url,
        "cta_label": "Open Link",
        "establishment_id": None,
        "establishment_name": None,
        "status": "draft",
        "created_at": None,
        "updated_at": None,
    }
    return deal


def extract_candidates_from_html(html, page_url):
    root = parse_html(html)
    blocks = candidate_blocks(root)
    deals = []
    seen_urls = set()
    for block in blocks:
        deal = extract_deal_data(block, page_url)
        if not deal or not deal["source_url"]:
            continue
        if deal["source_url"] in seen_urls:
            continue
        if deal["title"] and len(deal["title"]) < 5:
            continue
        seen_urls.add(deal["source_url"])
        deals.append(deal)
    return deals


def crawl_site(start_url, max_pages=MAX_PAGES):
    visited = set()
    queue = [start_url]
    collected = []
    while queue and len(visited) < max_pages:
        url = queue.pop(0)
        if url in visited:
            continue
        print(f"Crawling: {url}")
        visited.add(url)
        try:
            html = fetch_url(url)
        except Exception as exc:
            print(f"Failed to fetch {url}: {exc}", file=sys.stderr)
            continue
        links = extract_links(html, url)
        for link in links:
            if link not in visited and link not in queue:
                queue.append(link)
        deals = extract_candidates_from_html(html, url)
        if deals:
            print(f"  Found {len(deals)} candidate deals")
            collected.extend(deals)
    return collected


def save_output(records, path=OUTPUT_FILE):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(records)} records to {path}")


def main():
    records = crawl_site(START_URL)
    if not records:
        print("No candidates found. The page may require JS rendering or a stronger extraction strategy.")
        return
    save_output(records)


if __name__ == "__main__":
    main()
