export default function EmptyState({ message = "No products found." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
      {message}
    </div>
  );
}
