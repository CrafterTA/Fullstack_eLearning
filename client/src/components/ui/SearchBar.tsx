import { useState, ChangeEvent, FormEvent } from 'react';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

// Định nghĩa kiểu dữ liệu cho props
interface SearchBarProps {
  data?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ data }) => {
  const navigate = useNavigate();
  const [input, setInput] = useState<string>(data || '');

  const onSearchHandler = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/course-list/${input}`);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  return (
    <div>
      <form
        onSubmit={onSearchHandler}
        className="max-w-xl w-full md:h-14 h-12 flex items-center bg-white border border-gray-500/20 rounded"
      >
        <img src={assets.search_icon} alt="search" className="md:w-auto w-10 px-3" />
        <input
          onChange={handleInputChange}
          value={input}
          type="text"
          placeholder="Search for courses"
          className="w-full h-full outline-none text-gray-500/80"
        />
        <button
          className="bg-blue-600 rounded text-white md:px-10 px-7 md:py-3 py-2 mx-1"
          type="submit"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
