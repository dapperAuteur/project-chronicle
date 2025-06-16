import { MilestoneItemProps } from '@/types/milestone';

export default function MilestoneItem({ 
  milestone, 
  isEditing,
  editingName,
  setEditingName,
  editingDeadline,
  setEditingDeadline,
  onToggle,
  onMilestoneMove,
  goal,
  activeGoals,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onUpdate
}: MilestoneItemProps) {

  if (isEditing) {
    // --- RENDER EDIT VIEW ---
    return (
      <div className="bg-gray-700 p-2 rounded ml-4 space-y-2">
        <input
          type="text"
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          className="w-full bg-gray-800 p-2 rounded-md text-sm"
        />
        <input
          type="date"
          value={editingDeadline}
          onChange={(e) => setEditingDeadline(e.target.value)}
          className="w-full bg-gray-800 p-2 rounded-md text-sm"
        />
        <div className="flex gap-2">
          <button onClick={onUpdate} className="flex-grow text-sm bg-blue-600 hover:bg-blue-700 p-1 rounded-md">Save</button>
          <button onClick={onCancelEdit} className="flex-grow text-sm bg-gray-600 hover:bg-gray-700 p-1 rounded-md">Cancel</button>
        </div>
      </div>
    );
  }

  // --- RENDER NORMAL VIEW ---
  return (
    <div className="flex items-center justify-between bg-gray-700/50 p-2 rounded ml-4 hover:bg-gray-700">
      <div className="flex items-center gap-2">
        <input 
          type="checkbox"
          checked={milestone.status === 'Complete'}
          onChange={() => onToggle(milestone.id, milestone.status)}
          className="w-4 h-4 rounded accent-blue-500 flex-shrink-0"
        />
        <div>
          <p className={`${milestone.status === 'Complete' ? 'line-through text-gray-400' : ''}`}>{milestone.name}</p>
          {milestone.deadline && <p className="text-xs text-amber-400">Due: {milestone.deadline}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={goal.id} // The current goal
          onChange={(e) => onMilestoneMove(milestone.id, e.target.value, goal.id)}
          onClick={(e) => e.stopPropagation()} // Prevent expansion toggle
          className="bg-gray-700 text-xs rounded p-1 border-none"
        >
          <option value={goal.id} disabled>Move to...</option>
          {/* Filter out the current goal from the list of options */}
          {activeGoals.filter(g => g.id !== goal.id).map(targetGoal => (
            <option key={targetGoal.id} value={targetGoal.id}>
              {targetGoal.name}
            </option>
          ))}
        </select>
        <button onClick={() => onStartEdit(milestone)} className="text-xs p-1 hover:bg-white/20 rounded" title="Edit Milestone">✏️</button>
        <button onClick={() => onDelete(milestone.id)} className="text-xs p-1 hover:bg-white/20 rounded" title="Delete Milestone">🗑️</button>
      </div>
    </div>
  );
}