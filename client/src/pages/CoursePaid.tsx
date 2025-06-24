import React from 'react'

export default function CoursePaid() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Thumbnail */}
            <div>
                <img src="https://readymadeui.com/images/product6.webp" alt="Product" className="w-full h-auto object-cover rounded-lg shadow-md hover:scale-[1.05] transition-all duration-300" />
            </div>

            {/* Course Info */}
            <div className="flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">Mastering UI/UX Design</h2>
                <span className="text-sm text-gray-500">by Jane Doe</span>

                {/* Purchased Status */}
                <div className="flex items-center gap-2">
                    <span className="text-green-600 font-medium">✓ You have purchased this course</span>
                </div>

                {/* Access Button */}
                <div className="mt-4">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition cursor-pointer">
                        Go to your Course
                    </button>
                </div>

                {/* Course Description */}
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Course Overview</h3>
                    <p className="text-sm text-gray-600 mb-2">
                        This course guides you through the essentials of modern UI/UX design using real-world
                        projects and industry best practices. Ideal for beginners and intermediate designers.
                    </p>
                    <ul className="list-disc ml-5 text-sm text-gray-600 space-y-1">
                        <li>Learn Figma, Adobe XD, and Sketch from scratch</li>
                        <li>Real projects: apps, websites, and dashboards</li>
                        <li>Lifetime access & downloadable resources</li>
                        <li>Certificate of completion included</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
