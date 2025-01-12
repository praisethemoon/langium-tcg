import React from 'react';
import QuestionableCardArtwork from "../../assets/game/cards/questionable_card.jpg";
import { GiPolarStar } from 'react-icons/gi';


/**
 * Card component that renders the appropriate card type based on the card data
 */
export const QuestionableCard: React.FC = () => {
    return (
        <div className="card-base">
            <>
                <div className="flex justify-between items-center">
                    <h4 className="card-title">Questionable Card</h4>
                </div>

                <div className="card-rating">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <GiPolarStar 
                            key={index} 
                            size={18} 
                            className="text-yellow-400"
                        />
                    ))}
                </div>
                
                <div className="card-image-container">
                    <img 
                        src={QuestionableCardArtwork} 
                        alt="Questionable Card"
                        className="card-image"
                        loading="lazy"
                        draggable={false}
                    />
                </div>

                <div className="card-description">
                    Wondering what card are you making.. ?
                </div>
            </>
        </div>
    );
};
