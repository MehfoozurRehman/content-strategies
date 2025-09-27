import React from 'react'
import CustomButton from './CustomButton'
import CustomInput from './CustomInput'
import { appColors } from '@/lib/theme'

const SearchByDateModal = ({ fromDate, setToDate, setFromDate, setShowDateModal, handleDateSearch, toDate }) => {
    
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center" >
            <div className="p-6 rounded-lg shadow-md w-96" style={{ backgroundColor: appColors.primaryColor }}>
                <h2 className="text-lg font-semibold border-b mb-4 -mt-1">Filter by Date Range</h2>

                {/* From Date */}
                <CustomInput
                    label={"From Date"}
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full p-2 border rounded mb-3 bg-transparent text-white
              focus:outline-none focus:ring-1 focus:ring-blue-300
              [color-scheme:dark]"
                />

                {/* To Date */}
                <CustomInput
                    label={"To Date"}
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full p-2 border rounded mb-3 bg-transparent text-white
              focus:outline-none focus:ring-1 focus:ring-blue-300
              [color-scheme:dark]"
                />

                {/* Action divs */}
                <div className="flex justify-end space-x-3 -mb-2">
                    <CustomButton
                        title={"Cancel"}
                        onClick={() => setShowDateModal(false)}
                    />

                    <CustomButton
                        title={"Search"}
                        onClick={handleDateSearch}
                    />
                </div>
            </div>

        </div>
    )
}

export default SearchByDateModal
