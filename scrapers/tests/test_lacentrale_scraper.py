import unittest
from unittest.mock import patch, MagicMock
from scrapers.lacentrale_scraper import LaCentraleScraper
from datetime import datetime

class TestLaCentraleScraper(unittest.TestCase):
    def setUp(self):
        self.scraper = LaCentraleScraper()
        self.mock_search_html = """
        <html>
            <body>
                <div class="searchCard">
                    <a href="/auto-occasion-annonce-12345.html">
                        <h3 class="title">BMW Serie 3 320d xDrive</h3>
                        <div class="price">25 000 €</div>
                        <div class="specs">
                            <span class="year">2020</span>
                            <span class="mileage">30 000 km</span>
                            <span class="fuel">Diesel</span>
                            <span class="transmission">Automatique</span>
                        </div>
                        <div class="location">Paris (75)</div>
                    </a>
                </div>
                <div class="searchCard">
                    <a href="/auto-occasion-annonce-12346.html">
                        <h3 class="title">Audi A4 35 TDI</h3>
                        <div class="price">28 000 €</div>
                        <div class="specs">
                            <span class="year">2021</span>
                            <span class="mileage">20 000 km</span>
                            <span class="fuel">Diesel</span>
                            <span class="transmission">Manuelle</span>
                        </div>
                        <div class="location">Lyon (69)</div>
                    </a>
                </div>
            </body>
        </html>
        """
        
        self.mock_detail_html = """
        <html>
            <body>
                <h1 class="title">BMW Serie 3 320d xDrive</h1>
                <div class="price">25 000 €</div>
                <div class="mainCharacteristics">
                    <ul>
                        <li>Mise en circulation: 03/2020</li>
                        <li>Kilométrage: 30 000 km</li>
                        <li>Carburant: Diesel</li>
                        <li>Boîte de vitesse: Automatique</li>
                        <li>Couleur: Noir métallisé</li>
                    </ul>
                </div>
                <div class="options">
                    <h3>Options et équipements</h3>
                    <ul>
                        <li>GPS</li>
                        <li>Toit ouvrant</li>
                        <li>Sièges cuir</li>
                    </ul>
                </div>
                <div class="description">
                    Très belle BMW Serie 3 320d xDrive en excellent état.
                    Première main, carnet d'entretien complet.
                </div>
                <div class="sellerInfo">
                    <div class="location">Paris (75008)</div>
                    <div class="type">Professionnel</div>
                </div>
            </body>
        </html>
        """

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_scrape_search_page(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_search_html
        
        # Execute
        results = self.scraper.scrape_search_page('https://www.lacentrale.fr/listing')
        
        # Assert
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]['title'], 'BMW Serie 3 320d xDrive')
        self.assertEqual(results[0]['price'], 25000)
        self.assertEqual(results[0]['year'], 2020)
        self.assertEqual(results[0]['mileage'], 30000)
        self.assertEqual(results[0]['fuel_type'], 'Diesel')
        self.assertEqual(results[0]['transmission'], 'Automatique')
        self.assertEqual(results[0]['location'], 'Paris (75)')
        self.assertTrue(results[0]['url'].endswith('12345.html'))

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_scrape_detail_page(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_detail_html
        url = 'https://www.lacentrale.fr/auto-occasion-annonce-12345.html'
        
        # Execute
        result = self.scraper.scrape_listing(url)
        
        # Assert
        self.assertEqual(result['title'], 'BMW Serie 3 320d xDrive')
        self.assertEqual(result['price'], 25000)
        self.assertEqual(result['year'], 2020)
        self.assertEqual(result['mileage'], 30000)
        self.assertEqual(result['fuel_type'], 'Diesel')
        self.assertEqual(result['transmission'], 'Automatique')
        self.assertEqual(result['color'], 'Noir métallisé')
        self.assertEqual(result['location'], 'Paris (75008)')
        self.assertEqual(result['seller_type'], 'Professionnel')
        self.assertIn('GPS', result['options'])
        self.assertIn('Toit ouvrant', result['options'])
        self.assertIn('Sièges cuir', result['options'])
        self.assertTrue(result['description'].startswith('Très belle BMW'))
        self.assertEqual(result['source_url'], url)
        self.assertIn('scraped_at', result)

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_scrape_with_missing_data(self, mock_fetch):
        # Setup
        mock_fetch.return_value = """
        <html>
            <body>
                <h1 class="title">BMW Serie 3 320d xDrive</h1>
                <div class="price">Prix sur demande</div>
                <div class="mainCharacteristics">
                    <ul>
                        <li>Mise en circulation: 03/2020</li>
                        <li>Carburant: Diesel</li>
                    </ul>
                </div>
            </body>
        </html>
        """
        
        # Execute
        result = self.scraper.scrape_listing('https://www.lacentrale.fr/auto-occasion-annonce-12345.html')
        
        # Assert
        self.assertEqual(result['title'], 'BMW Serie 3 320d xDrive')
        self.assertIsNone(result['price'])
        self.assertEqual(result['year'], 2020)
        self.assertEqual(result['fuel_type'], 'Diesel')
        self.assertIsNone(result.get('mileage'))
        self.assertIsNone(result.get('transmission'))
        self.assertIsNone(result.get('color'))
        self.assertEqual(result.get('options', []), [])

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_pagination(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_search_html + """
        <div class="pagination">
            <span class="current">1</span>
            <a href="?page=2">2</a>
            <a href="?page=3">3</a>
            <a href="?page=2" class="next">Suivant</a>
        </div>
        """
        
        # Execute
        has_next, next_url = self.scraper.has_next_page(
            'https://www.lacentrale.fr/listing'
        )
        
        # Assert
        self.assertTrue(has_next)
        self.assertEqual(next_url, 'https://www.lacentrale.fr/listing?page=2')

    @patch('scrapers.base_scraper.BaseScraper.fetch_page')
    def test_no_next_page(self, mock_fetch):
        # Setup
        mock_fetch.return_value = self.mock_search_html + """
        <div class="pagination">
            <a href="?page=1">1</a>
            <span class="current">2</span>
        </div>
        """
        
        # Execute
        has_next, next_url = self.scraper.has_next_page(
            'https://www.lacentrale.fr/listing?page=2'
        )
        
        # Assert
        self.assertFalse(has_next)
        self.assertIsNone(next_url)

    def test_extract_year_from_date(self):
        test_cases = [
            ('03/2020', 2020),
            ('2020', 2020),
            ('01/01/2020', 2020),
            ('2020/01', 2020),
            ('Mise en circulation: 03/2020', 2020),
        ]
        
        for input_date, expected in test_cases:
            with self.subTest(input_date=input_date):
                result = self.scraper.extract_year_from_date(input_date)
                self.assertEqual(result, expected)

if __name__ == '__main__':
    unittest.main() 