import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InfoDialog = ({ open, onOpenChange }: InfoDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Info</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground space-y-3">
            <p className="font-medium">Signpost version 2.0 "Tutti Frutti"</p>
            <div>
              <p>Roman Sevcik</p>
              <a 
                href="mailto:roman.sevcik@ext.esa.int" 
                className="text-primary hover:underline break-all"
              >
                roman.sevcik@ext.esa.int
              </a>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
