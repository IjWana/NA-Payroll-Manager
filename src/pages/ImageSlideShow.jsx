import React, { useState, useEffect } from "react";

const images = [
  "/images/pmk.jpg",
  "/images/MajAllen.jpeg",
  "/images/Portrait.jpg",
  "/images/E_Ali.jpg",
  "/images/Achonu.jpeg",

];

const ImageSlideshow = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // change image every 3 seconds

    return () => clearInterval(interval); // clean up interval on unmount
  }, []);

  return (
    <div className=" w-full max-w-sm h-full flex items-center justify-center rounded overflow-hidden bg-gray-100">
      <img
        src={images[currentIndex]}
        alt={`Slide ${currentIndex + 1}`}
        className="object-cover w-full h-full"
      />
    </div>
  );
};

export default ImageSlideshow;
