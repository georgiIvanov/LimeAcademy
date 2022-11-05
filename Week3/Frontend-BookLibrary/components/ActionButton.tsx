export interface ActionButtonProps {
  title: string
  disabled?: boolean
  onClick: () => void
}

export const ActionButton = ({ title, disabled, onClick }: ActionButtonProps): JSX.Element => {
  return <button
    disabled={disabled}
    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
    onClick={onClick}
  >
    {title}
  </button>
}