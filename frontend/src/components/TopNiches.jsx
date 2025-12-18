// frontend/src/components/TopNiches.jsx
import React from 'react';

const services = [
  {
    id: 1,
    service: "Software Development",
    description:
      "Innovative software development services to build, maintain, and upgrade applications, ensuring they meet the highest quality standards.",
  },
  {
    id: 2,
    service: "Web Development",
    description:
      "Comprehensive web development solutions from front-end design to back-end integration, delivering responsive and user-friendly websites.",
  },
  {
    id: 3,
    service: "Data Science",
    description:
      "Advanced data science services to analyze and interpret complex data, providing actionable insights and data-driven solutions.",
  },
  {
    id: 4,
    service: "Cloud Computing",
    description:
      "Reliable cloud computing services to manage, store, and process data efficiently, offering scalable and flexible cloud solutions.",
  },
  {
    id: 5,
    service: "DevOps",
    description:
      "DevOps services to streamline software development and operations, enhancing deployment efficiency and reducing time to market.",
  },
  {
    id: 6,
    service: "Mobile App Development",
    description:
      "Expert mobile app development for iOS and Android platforms, creating intuitive and engaging mobile experiences for your users.",
  },
];

const TopNiches = () => {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl sm:text-3xl font-semibold text-dark text-center mb-8">
          Top Niches
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((element) => (
            <div
              key={element.id}
              className="p-6 bg-neutral rounded-lg shadow-md hover:shadow-lg transition-shadow text-center"
            >
              <h4 className="text-lg sm:text-xl font-medium text-dark mb-2">
                {element.service}
              </h4>
              <p className="text-gray-600 text-sm sm:text-base">
                {element.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopNiches;