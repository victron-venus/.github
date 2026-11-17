"""Publishing contract: this repository redirects to the maintained site.

The organization site is served from ``victron-venus.github.io``. This
repository keeps stable redirect stubs so historical links keep working, and
must not publish a second, competing copy of the catalog or the guides.
"""
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://victron-venus.github.io/'

REQUIRED_REDIRECTS = {
    'index.html': SITE,
    'projects.html': SITE + '#projects',
    'wiki/index.html': SITE + '#docs',
    'wiki/install.html': SITE + '#install',
    'wiki/architecture.html': SITE + '#architecture',
    'wiki/integration.html': SITE + '#integration',
    'wiki/ci-standards.html': SITE + '#ci',
    'wiki/contributing.html': SITE + '#contributing',
}


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.canonical, self.refresh, self.resources = None, None, []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'meta' and attrs.get('http-equiv') == 'refresh':
            self.refresh = attrs.get('content', '')
        if tag in ('script', 'img') and attrs.get('src'):
            self.resources.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.resources.append(attrs.get('href'))


class RedirectSiteTests(unittest.TestCase):
    def test_every_legacy_path_is_a_redirect_to_the_site(self):
        for name, target in REQUIRED_REDIRECTS.items():
            page = Page((ROOT / name).read_text())
            self.assertEqual(page.canonical, target, name)
            self.assertIn(target, page.refresh or '', name)

    def test_no_competing_content_or_assets_are_published(self):
        self.assertFalse((ROOT / 'assets').exists())
        self.assertFalse((ROOT / 'assets/search-index.json').exists())
        for name in REQUIRED_REDIRECTS:
            page = Page((ROOT / name).read_text())
            for value in page.resources:
                url = urlsplit(value)
                self.assertTrue(url.netloc, f'{name}: local asset {value}')

    def test_redirects_carry_noindex_and_no_local_scripts(self):
        for name in [*REQUIRED_REDIRECTS, '404.html']:
            text = (ROOT / name).read_text()
            self.assertIn('name="robots" content="noindex"', text, name)

    def test_404_points_at_the_maintained_site(self):
        text = (ROOT / '404.html').read_text()
        self.assertIn('https://victron-venus.github.io/', text)


if __name__ == '__main__':
    unittest.main()
