import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  categoryTitle: string;
  linkCount: number;
}

export const DeleteCategoryDialog = ({
  open,
  onOpenChange,
  onConfirm,
  categoryTitle,
  linkCount,
}: DeleteCategoryDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Smazat kategorii?</AlertDialogTitle>
          <AlertDialogDescription>
            Opravdu chcete smazat kategorii <strong>"{categoryTitle}"</strong>?
            {linkCount > 0 && (
              <span className="block mt-2 text-destructive">
                Tato akce smaže také všech {linkCount} {linkCount === 1 ? 'odkaz' : linkCount < 5 ? 'odkazy' : 'odkazů'} v této kategorii.
              </span>
            )}
            <span className="block mt-2">
              Tuto akci nelze vrátit zpět.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-destructive hover:bg-destructive/90">
            Smazat
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
