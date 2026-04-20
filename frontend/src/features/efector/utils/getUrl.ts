import { useLocation } from "react-router-dom";

export const useEfectorIdFromUrl = (): number | null => {    
    const location = useLocation();

    const search = new URLSearchParams(location.search);
    const efQuery = search.get("efector");

    const stateEf =
        typeof location.state === "number"
            ? location.state
            : undefined;

    const efectorId = efQuery
        ? Number(efQuery)
        : stateEf ?? null;

    return efectorId;
};