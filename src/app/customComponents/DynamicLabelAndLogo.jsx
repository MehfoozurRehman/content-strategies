"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getCompanyConfig } from "../constants/constant";

const DynamicBranding = ({
    showLogo = true,
    showTitle = false,
    logoClassName = "h-12 w-auto",
    titleClassName = "text-2xl font-bold mt-4 mb-2",
    logoWidth = 150,
    logoHeight = 150,
    logoLink = "/assistant"
}) => {
    const [company, setCompany] = useState(getCompanyConfig(null));

    useEffect(() => {
        const companyId = localStorage.getItem("company_id");
        setCompany(getCompanyConfig(companyId));
    }, []);

    return (
        <div className="flex items-center gap-4">
            {showLogo && (
                <div className="text-xl font-bold">
                    <Link href={logoLink}>
                        <Image
                            width={logoWidth}
                            height={logoHeight}
                            src={company.logo}
                            alt="Company Logo"
                            className={logoClassName}
                        />
                    </Link>
                </div>
            )}

            {showTitle && (
                <h1 className={titleClassName}>
                    {company.podcastTitle}
                </h1>
            )}
        </div>
    );
};

export default DynamicBranding;