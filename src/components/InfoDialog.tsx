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
          <AlertDialogDescription className="text-foreground space-y-2">
            <p>If you have any question or request please contact OPS-GS MOI-IT Team.</p>
            <p>
              <a 
                href="mailto:ops-gs.moi-it@esa.int" 
                className="text-primary hover:underline break-all"
              >
                ops-gs.moi-it@esa.int
              </a>
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
