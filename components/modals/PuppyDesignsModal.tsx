import React from 'react';
import { PUPPY_IMAGES } from '../../constants/puppyImages';
import { ModalBase, ModalHeader, ModalContent } from './ModalBase';

interface PuppyDesignsModalProps {
  onClose: () => void;
}

export const PuppyDesignsModal: React.FC<PuppyDesignsModalProps> = ({ onClose }) => {
  // Puppy names matching the order in constants/puppyImages.ts
  const puppyNames = [
    'Brown Ears', 'Spotted', 'Husky', 'Pug/Bulldog', 'White Pug',
    'Golden/Floppy', 'Standing Puppy', 'Cute Puppy', 'Angry Puppy', 'Puppy',
    'Black Sitting Puppy', 'White Sitting Puppy', 'Pug', 'Baby Puppy', 'Puppy with Belt',
    'Puppy Sketch', 'Dalmatian Puppy', 'Chocolate Lab Puppy', 'Beagle Puppy', 'Shih Tzu Puppy',
    'German Shepherd Puppy', 'Golden Retriever Puppy', 'Border Collie Puppy', 'Happy Smiling Puppy',
    'Curly Haired Puppy', 'Fluffy White Puppy', 'Tricolor Puppy', 'Pointy Eared Puppy', 'Long-haired Puppy',
    'Black Puppy', 'Sketch Pug', 'OG Dog', 'Orange Fox'
  ];

  return (
    <ModalBase isOpen={true} onClose={onClose} maxWidth="4xl">
      <ModalHeader className="bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-6 pb-4 border-b border-purple-300">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <span className="text-2xl">🐾</span>
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">🎨 Hidden Puppy Designs</h3>
            <p className="text-xs text-white/90 font-medium">All {PUPPY_IMAGES.length} Unique Puppies in the Game!</p>
          </div>
        </div>
      </ModalHeader>
      <ModalContent className="p-6 pt-4">
          <p className="text-slate-700 text-sm mb-4 leading-relaxed font-medium text-center">
            Discover all the adorable puppy designs hidden throughout the game! Each level features these unique puppies camouflaged in the scenes. Can you find them all? 🎯
          </p>

          {/* Puppy Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {PUPPY_IMAGES.map((image, index) => {
              const puppyName = puppyNames[index] || `Puppy #${index + 1}`;
              
              return (
                <div 
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <div className="flex flex-col items-center">
                    <img 
                      src={image} 
                      alt={puppyName}
                      className="w-20 h-20 object-contain mb-2"
                    />
                    <span className="text-xs font-bold text-slate-800 text-center leading-tight mb-1">
                      {puppyName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      #{index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Badge */}
          <div className="mt-6 flex items-center justify-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-md flex items-center gap-2">
              <span>🎯</span>
              <span>Find Them All!</span>
            </div>
          </div>
      </ModalContent>
    </ModalBase>
  );
};
