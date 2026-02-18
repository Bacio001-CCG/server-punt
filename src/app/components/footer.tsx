"use client";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";

export default function Footer() {
    return (
        <footer className="py-16 pt-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    <div className="flex gap-10">
                        <Link
                            href="/"
                            className="flex items-center justify-center mb-5 text-2xl font-semibold text-gray-900"
                        >
                            <Image
                                width={48}
                                height={48}
                                src="/logo.png"
                                className="mr-1"
                                alt="ServerPunt Logo"
                            />
                            ServerPunt
                        </Link>
                    </div>

                    <div className="grid w-full max-w-4xl gap-8 text-sm text-gray-600 md:grid-cols-3">
                        <div>
                            <h3 className="mb-3 text-base font-semibold text-gray-900">
                                Contact
                            </h3>
                            <ul className="space-y-2">
                                <p>
                                    <a
                                        href="mailto:info@serverpunt.com"
                                        className="text-gray-900 hover:underline"
                                    >
                                        info@serverpunt.com
                                    </a>
                                </p>
                                <p>Kraaivenstraat 36-07</p>
                                <p>5048 AB Tilburg</p>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-base font-semibold text-gray-900">
                                Bedrijf
                            </h3>
                            <ul className="space-y-2">
                                <li>
                                    <Link
                                        href="/about-us"
                                        className="hover:underline"
                                    >
                                        About us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/tos" className="hover:underline">
                                        Algemene voorwaarden
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy" className="hover:underline">
                                        Privacy beleid
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/tos#warranty"
                                        className="hover:underline"
                                    >
                                        Garantie beleid
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-3 text-base font-semibold text-gray-900">
                                Gegevens
                            </h3>
                            <ul className="space-y-2">
                                <li>KvK nummer: 97831441</li>
                                <li>BTW nummer: NL868250983B01</li>
                            </ul>
                        </div>
                    </div>
                    <div className="w-2/3 relative items-center justify-center">
                        <span className="mt-8 block text-xs text-gray-500">
                            © {new Date().getFullYear()} ServerPunt VOF. All Rights
                            Reserved.
                        </span>
                        <div className="md:absolute mt-2 md:mt-0 right-0 bottom-0 md:top-1/2 md:justify-center md:transform">
                            <div className="trustpilot-widget" data-locale="en-US" data-template-id="56278e9abfbbba0bdcd568bc" data-businessunit-id="6942f7a473b68c1c75a316b9" data-style-height="52px" data-style-width="100%" data-token="98e50d98-e71c-4729-a790-9d86ed0e7e63">
                                <a href="https://www.trustpilot.com/review/serverpunt.com" target="_blank" rel="noopener">Trustpilot</a>
                            </div>
                        </div>
                    </div>

                    <ul className="flex justify-center mt-5 space-x-5">
                        <li>
                            <Link
                                href="https://www.instagram.com/serverpunt/"
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://www.linkedin.com/in/serverpunt-bb583136a/"
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                                </svg>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <Script
                src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"
                strategy="afterInteractive"
            />
        </footer>
    );
}
