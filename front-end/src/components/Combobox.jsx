import { useState, useRef, useEffect } from "react";
import "../styling/combo.css"

export default function ComboBox({
    options = [],
    onChange,
    placeholder = "Select...",
    focus = false,
}) {
    // text value inserted in input field
    const [inputValue, setInputValue] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    // is dropbox opened
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const listRef = useRef(null);

    // filter options by starting string
    const filteredOptions = options.filter((opt)=>
        opt.toLowerCase().startsWith(inputValue?.toLowerCase())
    );

    // detect click outside of the div and close options tab
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    // make sure list scrolls when hidden elements are highlighted
    useEffect(() => {
        const listElement = listRef.current;
        const item = listElement?.children[highlightedIndex];

        if (item) {
            item.scrollIntoView({
                block: 'nearest',
            });
        }
    }, [highlightedIndex]);

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
                autoFocus={focus}
                onChange={(e) => {
                    setInputValue(e.target.value);
                    setIsOpen(true);
                    onChange?.(e.target.value); // execute calllback passed as arg
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown= {(e) => {
                    switch(e.key) {
                        case "ArrowDown":
                            e.preventDefault();
                            // set highlighted values as one down
                            setHighlightedIndex(
                                (highlightedIndex >= filteredOptions.length) ? 0 : highlightedIndex+1
                            );
                            break;
                        case "ArrowUp":
                            e.preventDefault();
                            // set highlighted tab as one upper
                            setHighlightedIndex(
                                (highlightedIndex < 0) ? filteredOptions.length - 1 : highlightedIndex-1
                            );
                            break;
                        case "Enter":
                            e.preventDefault();
                            // set option as input value if it was selected
                            console.log("index: ", highlightedIndex);
                            const new_input_val = (highlightedIndex != -1) ? filteredOptions[highlightedIndex] : inputValue;
                            setInputValue(new_input_val);
                            onChange?.(new_input_val);
                            setIsOpen(false);
                            break;
                        case "Escape":
                            e.preventDefault();
                            setIsOpen(false);
                            break;
                        default:
                            break;
                    } 
                }}
            />
            {isOpen && filteredOptions.length > 0 && (
                <ul className="combo-options" ref={listRef}>
                    {filteredOptions.map((option, index)=>(
                        <li key={option} 
                            onClick={() => handleSelect(option)}
                            className={index == highlightedIndex ? "active" : ""}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};