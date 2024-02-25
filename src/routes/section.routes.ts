import { Application } from "express";

import { getSectionsList,createSection,getSection,editSection,addSectionParticular } from "../controllers/section.controller";

export function SectionRoute(app: Application) {

     /**
    * payments list
    **/
    app.get("/sections",
    getSectionsList
    );

    app.get("/sections/:id",
    getSection
    )

    app.patch("/sections/:id",
    editSection
    )


    app.post("/sections/create",
    createSection
    )

    app.post('/sections/particular/create/:id',addSectionParticular)

}
