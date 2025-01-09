import { Button } from "@/components/ui/button";

export default function IconButton({ icon, onClick }: { icon: React.ReactNode; onClick: () => void }) {
  return (
    <Button variant="outline" size="icon" onClick={onClick}>
      {icon}
    </Button>
  );
}
