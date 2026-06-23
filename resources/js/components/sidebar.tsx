"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface SidebarLinkItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

export interface SidebarContextProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
    undefined
);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
};

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    const [openState, setOpenState] = useState(false);

    const open = openProp !== undefined ? openProp : openState;
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const Sidebar = ({
    children,
    open,
    setOpen,
    animate,
}: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
}) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    );
};

export const SidebarBody = ({
    mobileHeader,
    ...props
}: React.ComponentProps<typeof motion.div> & {
    mobileHeader?: React.ReactNode;
}) => {
    const mobile = useIsMobile();
    return mobile ? (
        <MobileSidebar
            header={mobileHeader}
            {...(props as React.ComponentProps<"div">)}
        />
    ) : (
        <DesktopSidebar {...props} />
    );
};

export const DesktopSidebar = ({
    className,
    children,
    ...props
}: React.ComponentProps<typeof motion.div>) => {
    const { open, setOpen, animate } = useSidebar();
    return (
        <motion.div
            className={cn(
                "h-full px-3 py-4 hidden md:flex md:flex-col shrink-0 overflow-hidden",
                className
            )}
            animate={{
                width: animate ? (open ? "250px" : "68px") : "250px",
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const MobileSidebar = ({
    className,
    children,
    header,
    ...props
}: React.ComponentProps<"div"> & { header?: React.ReactNode }) => {
    const { open, setOpen } = useSidebar();
    return (
        <div
            className={cn(
                "px-8 py-4 flex flex-row md:hidden items-center justify-between w-full"
            )}
            {...props}
        >
            <div className="flex justify-between items-center z-20 w-full">
                {header ? (
                    <div className="flex-1">{header}</div>
                ) : null}
                <div className="flex items-center gap-4 ml-auto">
                    <IconMenu2
                        className="text-primary-foreground"
                        onClick={() => setOpen(!open)}
                    />
                </div>
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: "-100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "-100%", opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: "easeInOut",
                        }}
                        className={cn(
                            "fixed h-full w-full inset-0 p-10 z-[100] flex flex-col justify-between bg-sidebar",
                            className
                        )}
                    >
                        <div
                            className="absolute right-10 top-10 z-50 text-card-foreground dark:text-card-foreground"
                            onClick={() => setOpen(!open)}
                        >
                            <IconX />
                        </div>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const SidebarLink = ({
    link,
    className,
    ...props
}: {
    link: SidebarLinkItem;
    className?: string;
} & Omit<React.ComponentProps<"a">, "href">) => {
    const { open, animate } = useSidebar();
    return (
        <a
            href={link.href}
            className={cn(
                "flex items-center gap-2 group/sidebar py-2 overflow-hidden min-w-0 flex-nowrap",
                className
            )}
            {...props}
        >
            <div className="shrink-0 flex items-center justify-center w-8">
                {link.icon}
            </div>
            <motion.span
                animate={{
                    opacity: animate ? (open ? 1 : 0) : 1,
                }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                className="text-card-foreground text-sm group-hover/sidebar:translate-x-1 transition-transform duration-150 whitespace-nowrap overflow-hidden !p-0 !m-0"
                style={{ display: 'inline-block', minWidth: 0 }}
            >
                {link.label}
            </motion.span>
        </a>
    );
};
