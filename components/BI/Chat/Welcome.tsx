export function Welcome() {
  return (
    <div className="flex-1 flex items-center justify-center text-center p-4">
      <div className="max-w-md space-y-2">
        <h2 className="text-2xl font-semibold">Welcome to Chat</h2>
        <p className="text-muted-foreground">
          Start typing below to begin a new conversation.
        </p>
      </div>
    </div>
  );
}
