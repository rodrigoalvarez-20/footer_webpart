import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-webpart-base';

import axios from "axios";

import FooterWebPart from './components/FooterWebPart';
import { IFooterWebPartProps } from './components/IFooterWebPartProps';

export interface IFooterWebPartWebPartProps {
  section_list : string;
  footer_list : string;
  logo_image : string;
  contacts_list : string;
}

export default class FooterWebPartWebPart extends BaseClientSideWebPart<IFooterWebPartWebPartProps> {
  private site_lists : IPropertyPaneDropdownOption[];

  public render(): void {
    const element: React.ReactElement<IFooterWebPartProps > = React.createElement(
      FooterWebPart,
      {
        section_list : this.properties.section_list,
        footer_list : this.properties.footer_list,
        logo_image : this.properties.logo_image,
        contacts_list : this.properties.contacts_list,
        context: this.context
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }
  
  protected onPropertyPaneConfigurationStart() {
    this.loadLists().then(response => {
      this.site_lists = response;
      this.context.propertyPane.refresh();
      this.render();
    }).catch(error => {
      console.log(error);
    });
  } 
  
  private loadLists(): Promise<IPropertyPaneDropdownOption[]> {
    return new Promise<IPropertyPaneDropdownOption[]>(
      (resolve : (options: IPropertyPaneDropdownOption[]) => void, reject: (error: any) => void) => {
        axios.get(`${this.context.pageContext.site.absoluteUrl}/_api/web/lists`).then(response => {
          let data : JSON = response.data;
          let lists : Map<string, any> = data["value"];
          var items = [];
          lists.forEach(value =>{
            items.push({ key: value["Title"], text: value["Title"] });
          });
          resolve(items);
        }).catch(error => {
          reject(error);
        })
      });
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Configuracion de pie de pagina"
          },
          groups: [
            {
              groupName: "Ajustes",
              groupFields: [
                PropertyPaneDropdown('section_list', {
                  label: "Seleccione la lista de las secciones a mostrar",
                  options: this.site_lists,
                  disabled: false
                }),
                PropertyPaneDropdown('footer_list', {
                  label: "Seleccione la lista de los enlaces a mostrar",
                  options: this.site_lists,
                  disabled: false
                }),
                PropertyPaneTextField('logo_image', {
                  label: "URL del logo corporativo"
                }),
                PropertyPaneDropdown('contacts_list', {
                  label: "Seleccione la lista de los contactos a mostrar",
                  options: this.site_lists,
                  disabled: false
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
