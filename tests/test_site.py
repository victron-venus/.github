"""Publishing contracts: local navigation, stable search anchors and asset bounds."""
import importlib.util
import json
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('site_index', ROOT / 'scripts/build-search-index.py')
INDEX = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(INDEX)


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links, self.resources = [], [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a' and 'href' in attrs:
            self.links.append(attrs['href'])
        if tag in ('script', 'img') and attrs.get('src'):
            self.resources.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.resources.append(attrs['href'])


class PublicSiteTests(unittest.TestCase):
    def test_index_is_current(self):
        self.assertEqual((ROOT / 'assets/search-index.json').read_text(), INDEX.build())

    def test_index_anchors_exist_without_javascript(self):
        entries = json.loads(INDEX.build())
        self.assertGreater(len(entries), 15)
        for entry in entries:
            url = urlsplit(entry['url'])
            self.assertFalse(url.scheme or url.netloc)
            page = Page((ROOT / url.path).read_text())
            if url.fragment:
                self.assertIn(url.fragment, page.ids, entry['url'])
        self.assertTrue(any('battery' in e['text'].lower() for e in entries))

    def test_public_pages_have_local_assets_and_no_duplicate_ids(self):
        for path in [*ROOT.glob('*.html'), *(ROOT / 'wiki').glob('*.html')]:
            page = Page(path.read_text())
            self.assertEqual(len(page.ids), len(set(page.ids)), path.name)
            for value in page.resources:
                url = urlsplit(value)
                self.assertFalse(url.netloc or url.scheme, value)
                target = ROOT / unquote(url.path.removeprefix('/.github/')) if url.path.startswith('/.github/') else path.parent / unquote(url.path)
                self.assertTrue(target.is_file(), value)

    def test_local_navigation_keeps_existing_targets(self):
        for path in [ROOT / 'index.html', ROOT / 'projects.html', *(ROOT / 'wiki').glob('*.html')]:
            for value in Page(path.read_text()).links:
                url = urlsplit(value)
                if url.netloc or url.scheme:
                    continue
                target = path.parent / unquote(url.path) if url.path else path
                if target.is_dir():
                    target /= 'index.html'
                self.assertTrue(target.is_file(), f'{path.name}: {value}')
                if url.fragment:
                    self.assertIn(unquote(url.fragment), Page(target.read_text()).ids, value)

    def test_search_excludes_navigation_and_script(self):
        parser = INDEX.Sections('guide.html')
        parser.feed('<main><nav>private nav noise</nav><h1>Guide</h1><p>Intro</p><h2 id="install">Install</h2><p>Read <strong>this</strong>.</p><script>secret()</script></main>')
        entries = parser.result()
        self.assertEqual(entries[1]['url'], 'guide.html#install')
        self.assertEqual(entries[1]['title'], 'Guide · Install')
        self.assertNotIn('private', json.dumps(entries))
        self.assertNotIn('secret', json.dumps(entries))

    def test_no_large_hero_or_javascript_dependencies(self):
        self.assertLess((ROOT / 'assets/img/energy-system.svg').stat().st_size, 12_000)
        self.assertLess((ROOT / 'assets/js/site.js').stat().st_size, 8_000)


if __name__ == '__main__':
    unittest.main()
