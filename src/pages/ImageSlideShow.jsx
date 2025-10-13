import React, { useState, useEffect } from "react";

const images = [
 "/images/Frame1.svg"
//   "/images/Frame2.svg",
//  "/images/Frame3.svg",
//  "/images/Frame4.svg",
//  "/images/Frame5.svg"
];

const ImageSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // change image every 5 seconds

    return () => clearInterval(interval); // clean up interval on unmount
  }, []);

  return (
    <div className=" w-96 h-full flex items-center justify-center rounded overflow-hidden bg-gray-100">
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className="object-cover w-full h-full"
      />
    </div>
  );
};

export default ImageSlideshow;
