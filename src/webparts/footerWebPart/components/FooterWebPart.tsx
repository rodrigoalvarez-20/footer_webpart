import * as React from 'react';
import { IFooterWebPartProps } from './IFooterWebPartProps';
import axios from "axios";
import AspectRatio from "react-aspect-ratio";
import 'bootstrap/dist/css/bootstrap.min.css';
import { ActionButton, IIconProps } from 'office-ui-fabric-react';
import styles from "./FooterWebPart.module.scss";

import {Row, Container, Col} from "react-bootstrap";

export interface ISection {
  Id : number;
  Title : string;
  Order : number;
}

export interface IFooterLink {
  Id: number;
  Title: string;
  SectionId : number;
  Url : string;
}

export interface IContact {
  Id : number;
  Title : string;
  Icon : string;
  Url : string;
}

class FooterWebPart extends React.Component<IFooterWebPartProps, any> {

  constructor(props){
    super(props);
    this.state = {
      secciones : [],
      links: [],
      logo: this.props.logo_image,
      contactos: []
    }
  }

  public componentDidMount(){
    let headers = {
      accept: "application/json;odata=verbose"
    };

    let urlSection = `${this.props.context.pageContext.site.absoluteUrl}/_api/web/lists/GetByTitle('${this.props.section_list}')/items`;
    let urlLinks = `${this.props.context.pageContext.site.absoluteUrl}/_api/web/lists/GetByTitle('${this.props.footer_list}')/items`;
    let urlContacts = `${this.props.context.pageContext.site.absoluteUrl}/_api/web/lists/GetByTitle('${this.props.contacts_list}')/items`;
    let reqSection = axios.get(urlSection, { headers: headers });
    let reqLinks = axios.get(urlLinks, { headers: headers });
    let reqContacts = axios.get(urlContacts, { headers: headers });
    
    axios.all([reqSection, reqLinks, reqContacts]).then(axios.spread((...responses)=>{
      let resSection = responses[0]["data"]["d"]["results"];
      let resLinks = responses[1]["data"]["d"]["results"];
      let resContacts = responses[2]["data"]["d"]["results"];

      resSection.forEach(result => {
        let section : ISection = { Title: result["Title"], Order: result["Order"], Id : result["Id"] };
        this.setState({ secciones : [...this.state.secciones, section] });
      });

      resContacts.forEach(result => {
        let contact : IContact = { Id: result["Id"], Title: result["Title"], Icon: result["Icono"], Url: result["url"]};
        this.setState({ contactos : [...this.state.contactos, contact] });
      });

      resLinks.forEach(result => {
        let link : IFooterLink = { Id: result["Id"], Title: result["Title"], Url: result["Url"], SectionId: result["SeccionId"] }
        this.setState({ links : [...this.state.links, link] });
      });

    })).catch(error => {
      console.info(`Ha ocurrido un error: ${error}`);
    });

  }

  //En las Col --> Secciones
  //En los Row --> Link de la seccion

  public render(): React.ReactElement<IFooterWebPartProps> {
    let contacts : IContact[] = this.state.contactos;
    let sects : ISection[] = this.state.secciones;
    let links : IFooterLink[] = this.state.links;
    return (
      <Container className={styles.container}>
        <Row>
          {
            sects.map(seccion => {
              return (
                <Col style={{ textAlign:"center", paddingTop:"12px", paddingBottom:"8px"}}>
                  <h4>{seccion.Title}</h4>
                  {
                    links.map(link => {
                      if(link.SectionId == seccion.Id){
                        return (
                          <ActionButton onClick={()=>{ window.open(link.Url, '_blank') }} className={styles["text-primary"]}>{link.Title}</ActionButton>
                        );
                      }
                    })
                  }
                </Col>
              );
            })
          }
          <Col style={{ textAlign:"center", paddingTop:"12px", paddingBottom:"8px"}}>
            <h4>Contactos</h4>
            <AspectRatio ratio="4/3">
              <img src={this.state.logo} style={{ maxWidth: "180px", maxHeight:"120px"}}/>
            </AspectRatio>
            <div style={{paddingTop:"12px"}}>
            {
              contacts.map(contacto => {
                return (
                  <ActionButton 
                    iconProps={{ iconName: contacto.Icon }} 
                    onClick={()=>{ window.open(contacto.Url, '_blank') }}
                    className={styles["text-primary"]}>
                      {contacto.Title}
                  </ActionButton>
                );
              })
            }
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default FooterWebPart;
