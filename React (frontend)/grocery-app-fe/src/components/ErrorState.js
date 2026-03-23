function ErrorState({ message }) {
  if (!message) {
    return null;
  }

  return <p className="status error">{message}</p>;
}

export default ErrorState;
