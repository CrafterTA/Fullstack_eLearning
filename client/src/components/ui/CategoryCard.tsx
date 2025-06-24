import React from 'react'

const CategoryCard = () => {
  return (
    <div className="list-category-card flex gap-[20px] py-[100px] px-[100px] ">
      <button className="btn-category-chosen ">Data Science</button>
      <button className="btn-category">Machine Learning</button>
      <button className="btn-category">Deep Learning</button>
      <button className="btn-category">NLP</button>
      <button className="btn-category">Computer Vision</button>
      <button className="btn-category">Time Series</button>
    </div>
  )
}
 
export default CategoryCard;
