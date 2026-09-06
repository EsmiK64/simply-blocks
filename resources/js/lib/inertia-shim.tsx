import React, { useEffect, useState } from 'react';

export function Head({
    title,
    children,
}: {
    title?: string;
    children?: React.ReactNode;
}) {
    useEffect(() => {
        if (title) {
            document.title = title;
        }
    }, [title]);

    return <>{children}</>;
}

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    method?: string;
    data?: Record<string, any>;
    preserveScroll?: boolean;
    preserveState?: boolean;
}

export function Link({ href, children, className, ...props }: LinkProps) {
    return (
        <a href={href} className={className} {...props}>
            {children}
        </a>
    );
}

export function usePage<T = Record<string, any>>() {
    return {
        url: typeof window !== 'undefined' ? window.location.pathname : '/',
        props: {
            auth: { user: null },
        } as unknown as T,
        version: '1.0.0',
    };
}

export const router = {
    visit(url: string) {
        if (typeof window !== 'undefined') {
            window.location.href = url;
        }
    },
    get(url: string) {
        if (typeof window !== 'undefined') {
            window.location.href = url;
        }
    },
    post(url: string) {
        if (typeof window !== 'undefined') {
            window.location.href = url;
        }
    },
    put(url: string) {
        if (typeof window !== 'undefined') {
            window.location.href = url;
        }
    },
    delete(url: string) {
        if (typeof window !== 'undefined') {
            window.location.href = url;
        }
    },
    reload() {
        if (typeof window !== 'undefined') {
            window.location.reload();
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    on(event: string, callback: (...args: any[]) => void) {
        return () => {};
    },
};

export function useForm<T extends Record<string, any>>(
    initialValues: T = {} as T,
) {
    const [data, setData] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing] = useState(false);

    return {
        data,
        setData: (keyOrUpdater: any, maybeValue?: any) => {
            if (typeof keyOrUpdater === 'string') {
                setData((prev) => ({ ...prev, [keyOrUpdater]: maybeValue }));
            } else if (typeof keyOrUpdater === 'function') {
                setData(keyOrUpdater);
            } else {
                setData(keyOrUpdater);
            }
        },
        errors,
        setErrors,
        processing,
        post: () => {},
        put: () => {},
        get: () => {},
        delete: () => {},
        reset: () => setData(initialValues),
        clearErrors: () => setErrors({}),
    };
}

export default {
    Head,
    Link,
    usePage,
    router,
    useForm,
};
