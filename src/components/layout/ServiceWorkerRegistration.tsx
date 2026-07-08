"use client";

import { useEffect } from "react";

const ServiceWorkerRegistration = () => {
    useEffect(() => {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        if (process.env.NODE_ENV === "production") {
            navigator.serviceWorker.register("/sw.js");
            return;
        }

        // In development, make sure a service worker installed by a previous
        // (or production) visit can't keep serving stale cached /_next/static
        // bundles -- that silently breaks layout/CSS changes on real devices.
        // Unregister any existing worker and drop its caches so the dev server
        // is always served fresh.
        navigator.serviceWorker
            .getRegistrations()
            .then((regs) => regs.forEach((reg) => reg.unregister()));
        if (typeof caches !== "undefined") {
            caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
        }
    }, []);

    return null;
};

export default ServiceWorkerRegistration;