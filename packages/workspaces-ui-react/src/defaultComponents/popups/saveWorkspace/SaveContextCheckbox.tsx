import React, { useEffect } from "react";
import { SaveContextCheckboxProps } from "../../../types/internal";

const SaveContextCheckbox: React.FC<SaveContextCheckboxProps> = ({ changeChecked, refreshHeight }) => {
    const inputRef = React.createRef<HTMLInputElement>();

    useEffect(() => {
        refreshHeight();
    }, []);

    const onInputChanged = () => {
        if (!inputRef?.current) {
            return;
        }

        changeChecked(inputRef.current.checked);
    }

    return (
        <div className="form-check">
            <input onChange={onInputChanged} ref={inputRef} className="form-check-input" type="checkbox" value="" id="saveContextCheckbox" />
            <label className="form-check-label" htmlFor="saveContextCheckbox">Save context</label>
        </div>
    )
};

export default SaveContextCheckbox;