import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetFooter,
  SheetClose,
} from "src/components/ui/sheet";
import { Avatar, AvatarFallback } from "src/components/ui/avatar";
import { Button } from "src/components/ui/button";
import { Icon } from "@iconify/react";
import { ShieldCheck, Mail, Building2, MapPin } from 'lucide-react';
import { Link } from "react-router";

export default function ProfileSheet() {
  return (
    <Sheet>
      {/* Trigger Button */}
      <SheetTrigger className="cursor-pointer hover:bg-bhagwa/10 flex items-center justify-center rounded-full h-10 w-10 border border-bhagwa/20">
        <Avatar className="h-8 w-8 bg-bhagwa text-white font-bold">
          <AvatarFallback className="bg-bhagwa text-white">NMC</AvatarFallback>
        </Avatar>
      </SheetTrigger>

      {/* Drawer Panel */}
      <SheetContent
        showCloseButton={false}
        side="right"
        className="border-s-0 w-full sm:max-w-80 max-w-60"
      >
        <SheetClose className="absolute top-5 end-5 p-2 hover:bg-primary/5 hover:text-primary rounded-full">
          <Icon icon="tabler:x" width={20} height={20} />
        </SheetClose>

        {/* Top Profile Section */}
        <div className="p-6 py-6">
          <div className="flex flex-col gap-4 justify-center items-center pt-8">
            <div className="size-20 rounded-full bg-gradient-to-br from-bhagwa to-bhagwa-dark text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-bhagwa/30">
              NMC
            </div>

            <div className="text-center">
              <h6 className="text-lg font-bold text-foreground flex items-center gap-1.5 justify-center">
                Admin NMC <ShieldCheck className="size-4 text-bhagwa" />
              </h6>
              <p className="text-xs font-semibold text-bhagwa uppercase tracking-wider mt-0.5">
                Chief Crisis Officer
              </p>
              <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground mt-2">
                <Building2 size={14} />
                <span>Nagpur Municipal Corporation</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground mt-1">
                <Mail size={14} />
                <span>admin@nmc.nagpur.gov.in</span>
              </div>
              <div className="flex items-center gap-1.5 justify-center text-xs text-muted-foreground mt-1">
                <MapPin size={14} />
                <span>Civil Lines HQ, Nagpur</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Capabilities */}
        <div className="border-t border-border p-6">
          <h6 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Control Privileges
          </h6>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center justify-between p-2 rounded bg-muted/40">
              <span>AI Model Override</span>
              <span className="text-emerald-600 font-bold">ACTIVE</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-muted/40">
              <span>Emergency Dispatch</span>
              <span className="text-emerald-600 font-bold">AUTHORIZED</span>
            </li>
            <li className="flex items-center justify-between p-2 rounded bg-muted/40">
              <span>SMS Broadcast Alert</span>
              <span className="text-emerald-600 font-bold">ENABLED</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <SheetFooter className="px-6 pb-6">
          <div className="w-full pt-4 border-t border-border flex flex-col gap-2">
            <Button
              variant="outline"
              render={<Link to="/settings" />}
              className="w-full"
            >
              System Settings
            </Button>
            <Button
              variant="secondary"
              render={<Link to="/auth/auth2/login" />}
              className="w-full text-bhagwa"
            >
              Switch Account
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
