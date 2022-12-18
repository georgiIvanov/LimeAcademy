export interface ActionButtonProps {
  title: string
  disabled?: boolean
  onClick: () => void
}

export const ActionButton = ({ title, disabled, onClick }: ActionButtonProps): JSX.Element => {
  let isButtonDisabled = disabled ? 'bg-gray-300 hover:bg-gray-400' : 'element-main hover:bg-sky-900 '
  return <button
    disabled={disabled}
    className={isButtonDisabled + " text-white font-bold py-1 px-2 rounded"}
    onClick={onClick}
  >
    {title}
  </button>
}