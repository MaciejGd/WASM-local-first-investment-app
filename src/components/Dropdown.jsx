import { useState, useRef, useEffect } from "react";
import "../styling/components.css"

export default function ComboBox({
    options = [],
    onChange,
    placeholder = "Select...",
}) {
    // text value inserted in input field
    const [inputValue, setInputValue] = useState("");
    // is dropbox opened
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // filter options by starting string
    const filteredOptions = options.filter((opt)=>
        opt.toLowerCase().startsWith(inputValue.toLowerCase())
    );
    console.log(`Length of filtered options: ${filteredOptions.length}`);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // handle value from options list selection
    const handleSelect = (option) => {
        setInputValue(option);
        onChange?.(option);
        setIsOpen(false);
    };

    return (
        <div className="combo-box" ref={wrapperRef}>
            <input
                type="text"
                value={inputValue}
                placeholder={placeholder}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setIsOpen(true);
                    onChange?.(e.target.value); // execute calllback passed as arg
                }}
                onFocus={() => {
                    console.log("test");    
                    setIsOpen(true)}
                }
            />
            {isOpen && filteredOptions.length > 0 && (
                <ul className="combo-options">
                    {filteredOptions.map((option)=>(
                        <li key={option} 
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

};