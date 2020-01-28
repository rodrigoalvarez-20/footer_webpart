import { BaseWebPartContext } from "@microsoft/sp-webpart-base";

export interface IFooterWebPartProps {
    section_list : string;
    footer_list : string;
    logo_image : string;
    contacts_list : string;
    context: BaseWebPartContext;
}
