import requests
import sys
from datetime import datetime
import json

class GameShopNepalAPITester:
    def __init__(self, base_url="https://shopease-199.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "gsnadmin", "password": "gsnadmin"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_categories_crud(self):
        """Test categories CRUD operations"""
        # Get categories
        success, categories = self.run_test("Get Categories", "GET", "categories", 200)
        
        # Create category
        success, new_cat = self.run_test(
            "Create Category",
            "POST", 
            "categories",
            200,
            data={"name": "Test Gaming"}
        )
        
        category_id = None
        if success and 'id' in new_cat:
            category_id = new_cat['id']
            
            # Update category
            self.run_test(
                "Update Category",
                "PUT",
                f"categories/{category_id}",
                200,
                data={"name": "Updated Gaming"}
            )
            
            # Delete category
            self.run_test(
                "Delete Category",
                "DELETE",
                f"categories/{category_id}",
                200
            )
        
        return category_id is not None

    def test_products_crud(self):
        """Test products CRUD operations"""
        # First create a category for products
        success, cat = self.run_test(
            "Create Category for Products",
            "POST",
            "categories", 
            200,
            data={"name": "Test Products"}
        )
        
        if not success:
            return False
            
        category_id = cat.get('id')
        
        # Get products
        self.run_test("Get Products", "GET", "products", 200)
        
        # Create product
        product_data = {
            "name": "Test Netflix",
            "description": "<p>Test Netflix subscription</p>",
            "image_url": "https://example.com/netflix.jpg",
            "category_id": category_id,
            "variations": [
                {
                    "id": "var1",
                    "name": "1 Month",
                    "price": 500,
                    "original_price": 600
                }
            ],
            "tags": ["Popular", "New"],
            "custom_fields": [
                {
                    "id": "field1",
                    "label": "Email Address",
                    "placeholder": "your@email.com",
                    "required": True
                }
            ],
            "is_active": True,
            "is_sold_out": False
        }
        
        success, new_product = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data=product_data
        )
        
        product_id = None
        if success and 'id' in new_product:
            product_id = new_product['id']
            
            # Get single product
            self.run_test(
                "Get Single Product",
                "GET",
                f"products/{product_id}",
                200
            )
            
            # Update product
            product_data["name"] = "Updated Netflix"
            self.run_test(
                "Update Product",
                "PUT",
                f"products/{product_id}",
                200,
                data=product_data
            )
            
            # Delete product
            self.run_test(
                "Delete Product",
                "DELETE",
                f"products/{product_id}",
                200
            )
        
        # Clean up category
        self.run_test("Delete Test Category", "DELETE", f"categories/{category_id}", 200)
        
        return product_id is not None

    def test_reviews_crud(self):
        """Test reviews CRUD operations"""
        # Get reviews
        self.run_test("Get Reviews", "GET", "reviews", 200)
        
        # Create review
        review_data = {
            "reviewer_name": "Test User",
            "rating": 5,
            "comment": "Great service!",
            "review_date": "2025-01-15T10:00:00Z"
        }
        
        success, new_review = self.run_test(
            "Create Review",
            "POST",
            "reviews",
            200,
            data=review_data
        )
        
        review_id = None
        if success and 'id' in new_review:
            review_id = new_review['id']
            
            # Update review
            review_data["comment"] = "Updated comment"
            self.run_test(
                "Update Review",
                "PUT",
                f"reviews/{review_id}",
                200,
                data=review_data
            )
            
            # Delete review
            self.run_test(
                "Delete Review",
                "DELETE",
                f"reviews/{review_id}",
                200
            )
        
        return review_id is not None

    def test_faqs_crud(self):
        """Test FAQs CRUD operations"""
        # Get FAQs
        self.run_test("Get FAQs", "GET", "faqs", 200)
        
        # Create FAQ
        faq_data = {
            "question": "Test question?",
            "answer": "Test answer",
            "sort_order": 0
        }
        
        success, new_faq = self.run_test(
            "Create FAQ",
            "POST",
            "faqs",
            200,
            data=faq_data
        )
        
        faq_id = None
        if success and 'id' in new_faq:
            faq_id = new_faq['id']
            
            # Update FAQ
            faq_data["answer"] = "Updated answer"
            self.run_test(
                "Update FAQ",
                "PUT",
                f"faqs/{faq_id}",
                200,
                data=faq_data
            )
            
            # Delete FAQ
            self.run_test(
                "Delete FAQ",
                "DELETE",
                f"faqs/{faq_id}",
                200
            )
        
        return faq_id is not None

    def test_social_links_crud(self):
        """Test social links CRUD operations"""
        # Get social links
        self.run_test("Get Social Links", "GET", "social-links", 200)
        
        # Create social link
        link_data = {
            "platform": "Test Platform",
            "url": "https://test.com",
            "icon": "test-icon"
        }
        
        success, new_link = self.run_test(
            "Create Social Link",
            "POST",
            "social-links",
            200,
            data=link_data
        )
        
        link_id = None
        if success and 'id' in new_link:
            link_id = new_link['id']
            
            # Update social link
            link_data["url"] = "https://updated.com"
            self.run_test(
                "Update Social Link",
                "PUT",
                f"social-links/{link_id}",
                200,
                data=link_data
            )
            
            # Delete social link
            self.run_test(
                "Delete Social Link",
                "DELETE",
                f"social-links/{link_id}",
                200
            )
        
        return link_id is not None

    def test_pages_api(self):
        """Test pages API"""
        # Get about page
        self.run_test("Get About Page", "GET", "pages/about", 200)
        
        # Get terms page
        self.run_test("Get Terms Page", "GET", "pages/terms", 200)
        
        # Update about page
        success, _ = self.run_test(
            "Update About Page",
            "PUT",
            "pages/about?title=Test About&content=<p>Test content</p>",
            200
        )
        
        return success

    def test_notification_bar(self):
        """Test notification bar API"""
        # Get notification bar
        self.run_test("Get Notification Bar", "GET", "notification-bar", 200)
        
        # Update notification bar
        notification_data = {
            "text": "Test notification",
            "link": "https://test.com",
            "is_active": True,
            "bg_color": "#F5A623",
            "text_color": "#000000"
        }
        
        success, _ = self.run_test(
            "Update Notification Bar",
            "PUT",
            "notification-bar",
            200,
            data=notification_data
        )
        
        return success

    def test_payment_methods(self):
        """Test payment methods API"""
        # Get payment methods
        self.run_test("Get Payment Methods", "GET", "payment-methods", 200)
        
        # Create payment method
        method_data = {
            "name": "Test Payment",
            "image_url": "https://example.com/payment.jpg",
            "is_active": True,
            "sort_order": 0
        }
        
        success, new_method = self.run_test(
            "Create Payment Method",
            "POST",
            "payment-methods",
            200,
            data=method_data
        )
        
        method_id = None
        if success and 'id' in new_method:
            method_id = new_method['id']
            
            # Delete payment method
            self.run_test(
                "Delete Payment Method",
                "DELETE",
                f"payment-methods/{method_id}",
                200
            )
        
        return method_id is not None

    def test_blog_posts(self):
        """Test blog posts API"""
        # Get blog posts
        self.run_test("Get Blog Posts", "GET", "blog", 200)
        
        # Create blog post
        post_data = {
            "title": "Test Blog Post",
            "slug": "test-blog-post",
            "excerpt": "Test excerpt",
            "content": "<p>Test content</p>",
            "image_url": "https://example.com/blog.jpg",
            "is_published": True
        }
        
        success, new_post = self.run_test(
            "Create Blog Post",
            "POST",
            "blog",
            200,
            data=post_data
        )
        
        post_id = None
        if success and 'id' in new_post:
            post_id = new_post['id']
            
            # Delete blog post
            self.run_test(
                "Delete Blog Post",
                "DELETE",
                f"blog/{post_id}",
                200
            )
        
        return post_id is not None

    def test_seed_data(self):
        """Test seed data endpoint"""
        success, _ = self.run_test("Seed Data", "POST", "seed", 200)
        return success

def main():
    print("🚀 Starting GameShop Nepal API Tests")
    print("=" * 50)
    
    tester = GameShopNepalAPITester()
    
    # Test admin login first
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1
    
    # Run all tests
    test_results = {
        "Categories CRUD": tester.test_categories_crud(),
        "Products CRUD": tester.test_products_crud(), 
        "Reviews CRUD": tester.test_reviews_crud(),
        "FAQs CRUD": tester.test_faqs_crud(),
        "Social Links CRUD": tester.test_social_links_crud(),
        "Pages API": tester.test_pages_api(),
        "Notification Bar": tester.test_notification_bar(),
        "Payment Methods": tester.test_payment_methods(),
        "Blog Posts": tester.test_blog_posts(),
        "Seed Data": tester.test_seed_data()
    }
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Total API calls: {tester.tests_run}")
    print(f"Successful calls: {tester.tests_passed}")
    print(f"Failed calls: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    print("\n🔍 Feature Test Results:")
    for feature, result in test_results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {feature}: {status}")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests Details:")
        for failure in tester.failed_tests:
            print(f"  - {failure.get('test', 'Unknown')}: {failure}")
    
    # Return 0 if all feature tests passed, 1 otherwise
    all_passed = all(test_results.values())
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())