export default function Keyboard() {
  const shortcuts = [
    { key: "/", description: "寻求建议" },
    { key: "Space", description: "应用建议" },
    { key: "Esc", description: "取消建议" },
  ];

  const ShortcutItem = ({ shortcut }: { shortcut: { key: string; description: string } }) => (
    <div className="flex justify-between items-center gap-2">
      <kbd className="rounded border px-2 py-1">{shortcut.key}</kbd>
      <span>{shortcut.description}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 text-sm text-muted-foreground fixed w-[150px] right-12 top-12">
      {shortcuts.map(shortcut => (
        <ShortcutItem key={shortcut.key} shortcut={shortcut} />
      ))}
    </div>
  );
}
