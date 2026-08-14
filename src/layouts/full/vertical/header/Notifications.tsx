import { useState } from "react";
import * as NotificationData from "./data";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { Bell } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { Badge } from "src/components/ui/badge";
import { Button } from "src/components/ui/button";
import { cn } from "src/lib/utils";
import { Link } from "react-router";

const Notifications = ({ className }: { className?: string }) => {
    const [notifications, setNotifications] = useState(NotificationData.Notification);

    const unreadCount = notifications.filter(item => !item.isRead).length;

    const handleMarkAsRead = (index: number) => {
        const updatedNotifications = [...notifications];
        updatedNotifications[index] = { ...updatedNotifications[index], isRead: true };
        setNotifications(updatedNotifications);
    };

    return (
        <div className={cn("", className)}>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <div className="relative cursor-pointer">
                        {unreadCount > 0 && (
                            <>
                                <span className="h-2.5 w-2.5 bg-destructive rounded-full absolute top-1 end-2 text-xs text-center text-white z-1 animate-ping" />
                                <span className="h-2.5 w-2.5 bg-destructive rounded-full absolute top-1 end-2 text-xs text-center text-white z-1" />
                            </>
                        )}
                        <div className="flex justify-center items-center hover:bg-primary/5 w-10 h-10 rounded-full">
                            <Bell
                                className="size-5"
                            />
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="w-screen sm:w-[360px] py-6 px-0"
                >
                    <div className="flex items-center px-6 justify-between">
                        <h3 className="text-lg font-semibold text-[#111111] dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge className="px-3 bg-[#FFC107] text-[#111111] hover:bg-[#FFC107] font-black">{unreadCount} new</Badge>
                        )}
                    </div>

                    {/* List */}
                    <SimpleBar className="max-h-80 mt-3">
                        <div className="flex flex-col">
                            {notifications.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleMarkAsRead(index)}
                                    className="px-6 py-3 flex justify-between items-center hover:bg-[#FFF8E1]/60 dark:hover:bg-slate-800/50 cursor-pointer"
                                >
                                    <div className="flex items-center w-full">
                                        <div
                                            className={cn(
                                                "h-11 w-11 shrink-0 rounded-full flex justify-center items-center",
                                                item.bgcolor
                                            )}
                                        >

                                            <item.icon height={20}
                                                className={item.color} />
                                        </div>

                                        <div className="ps-4 flex justify-between w-full">
                                            <div className="w-3/4 text-start">
                                                <h5 className={cn("mb-1 text-sm font-normal text-[#111111] dark:text-white", !item.isRead && "font-semibold")}>
                                                    {item.title}
                                                </h5>
                                                <div className="text-xs text-[#666666] dark:text-gray-400 line-clamp-1">
                                                    {item.subtitle}
                                                </div>
                                            </div>

                                            <div className="text-xs self-start pt-1.5 text-[#666666] dark:text-gray-400">
                                                {item.time}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SimpleBar>

                    {/* Footer Button */}
                    <div className="pt-5 px-6">
                        <Button className="w-full bg-[#FF8A00] hover:bg-[#E07A00] text-white font-bold" render={<Link to="/alerts" />}>
                            See All Alerts & Notifications
                        </Button>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default Notifications;
