import React from 'react';

const SkeletonCard: React.FC = () => {
    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-gray/50 h-full animate-pulse">
            <div className="relative aspect-[4/3] bg-gray-200">
                <div className="absolute top-4 left-4 w-20 h-6 bg-gray-300 rounded-full"></div>
            </div>

            <div className="p-6">
                {/* Title */}
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>

                {/* Location */}
                <div className="flex items-center mb-6">
                    <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>

                <div className="border-t border-brand-gray/50 my-4"></div>

                {/* Features */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
