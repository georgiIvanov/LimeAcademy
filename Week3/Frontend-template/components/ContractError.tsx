export interface ContractErrorProps {
  message: string | null
}

export const ContractError = ({message}: ContractErrorProps) => {
  if (message == null) {
    return <></>
  }

  return <div className="error"><b>{message}</b></div>
}