import { useEffect, useState } from "react";
import ManagementAPI from "./managementAPI";
import { SelectField } from "./crudkit";

/**
 * Organization picker for the management console — replaces raw "Organization ID"
 * text inputs so superadmins choose a tenant by name instead of guessing an id.
 * Self-loads the org list; the selected value is the org id (as a string, to
 * match how the forms already handle ids).
 */
export default function OrgSelect({ label = "Organization *", value, onChange }) {
    const [orgs, setOrgs] = useState([]);

    useEffect(() => {
        let cancelled = false;
        ManagementAPI.listOrgs(1, "", "")
            .then(d => { if (!cancelled) setOrgs(d.organizations || []); })
            .catch(() => { /* leave empty; form validation still guards */ });
        return () => { cancelled = true; };
    }, []);

    return (
        <SelectField
            label={label}
            value={value}
            onChange={onChange}
            options={[
                { value: "", label: "— select an organization —" },
                ...orgs.map(o => ({ value: String(o.id), label: `${o.name} (#${o.id})` })),
            ]}
        />
    );
}
