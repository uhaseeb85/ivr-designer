import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 py-16">
          <nav className="flex justify-between items-center mb-16">
            <div className="text-2xl font-bold">IVR Designer</div>
            <div className="space-x-4">
              <Link 
                href="/login" 
                className="px-4 py-2 border border-white rounded-md hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-opacity-90 transition-colors"
              >
                Register
              </Link>
            </div>
          </nav>
          
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Design Your IVR Authentication Flows
              </h1>
              <p className="text-xl mb-8">
                Create, validate, and manage your customer authentication journeys with our intuitive IVR design platform.
              </p>
              <Link 
                href="/register" 
                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-opacity-90 transition-colors"
              >
                Get Started
              </Link>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="w-full max-w-md bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-sm">
                <div className="border-2 border-white border-opacity-20 rounded-lg p-4 mb-4">
                  <div className="h-6 w-3/4 bg-white bg-opacity-20 rounded mb-2"></div>
                  <div className="h-4 w-full bg-white bg-opacity-20 rounded mb-1"></div>
                  <div className="h-4 w-5/6 bg-white bg-opacity-20 rounded"></div>
                </div>
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl">→</div>
                </div>
                <div className="border-2 border-white border-opacity-20 rounded-lg p-4 mt-4">
                  <div className="h-6 w-3/4 bg-white bg-opacity-20 rounded mb-2"></div>
                  <div className="h-4 w-full bg-white bg-opacity-20 rounded mb-1"></div>
                  <div className="h-4 w-5/6 bg-white bg-opacity-20 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-3">Token Management</h3>
              <p className="text-gray-600">Create and manage authentication tokens like SSN, debit card PIN, and account numbers.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-3">Visual Flow Designer</h3>
              <p className="text-gray-600">Design authentication flows with our intuitive visual designer and drag-and-drop interface.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-3">Multi-Path Support</h3>
              <p className="text-gray-600">Create branching paths based on customer responses and handle various authentication scenarios.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to improve your customer authentication?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join businesses that use our platform to create seamless and secure authentication experiences.
          </p>
          <Link 
            href="/register" 
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-xl font-bold">IVR Designer</div>
              <div className="text-gray-400 text-sm">© 2023 All Rights Reserved</div>
            </div>
            <div className="flex space-x-6">
              <Link href="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link>
              <Link href="/contact" className="text-gray-300 hover:text-white">Contact Us</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
