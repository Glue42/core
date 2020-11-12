import React from "react";
import { getFeedbackErrorMessage } from "./helpers";

const Feedback: React.FC<{ errMessage: string }> = ({ errMessage }) => {
    const message = getFeedbackErrorMessage(errMessage);
    return (
        <div className="row">
            <div className="col">
                <div id="feedbackContainer" className="d-flex flex-row pb-2">
                    <div className="invalid-feedback mt-0 d-block">
                        {message || "Something went wrong."}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Feedback;