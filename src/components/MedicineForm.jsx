import React, { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';

const MedicineForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    dosage: '',
    frequency: 'daily',
    times: [''],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTimeChange = (index, value) => {
    const newTimes = [...formData.times];
    newTimes[index] = value;
    setFormData({ ...formData, times: newTimes });
  };

  const addTimeSlot = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '']
    });
  };

  const removeTimeSlot = (index) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty time slots
    const validTimes = formData.times.filter(time => time.trim() !== '');
    
    if (validTimes.length === 0) {
      alert('Please add at least one time slot');
      return;
    }

    onSubmit({ ...formData, times: validTimes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Medicine Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., Aspirin"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dosage *
          </label>
          <input
            type="text"
            name="dosage"
            value={formData.dosage}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., 500mg"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Frequency *
        </label>
        <select
          name="frequency"
          value={formData.frequency}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value="daily">Daily</option>
          <option value="twice-daily">Twice Daily</option>
          <option value="thrice-daily">Thrice Daily</option>
          <option value="weekly">Weekly</option>
          <option value="as-needed">As Needed</option>
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Time Slots *
          </label>
          <button
            type="button"
            onClick={addTimeSlot}
            className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center"
          >
            <FiPlus className="mr-1" />
            Add Time
          </button>
        </div>
        
        <div className="space-y-2">
          {formData.times.map((time, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                className="input-field flex-1"
                required
              />
              {formData.times.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTimeSlot(index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            End Date (Optional)
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Instructions
        </label>
        <textarea
          name="instructions"
          value={formData.instructions}
          onChange={handleChange}
          className="input-field resize-none"
          rows="3"
          placeholder="e.g., Take with food, Avoid alcohol"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button type="submit" className="btn-primary flex-1">
          {initialData ? 'Update Medicine' : 'Add Medicine'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default MedicineForm;
