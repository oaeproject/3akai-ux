define(["config/config"], function(config) {

        // Insert custom configuration here

        // Custom CSS Files to load in:
        config.skinCSS = ["/dev/skins/default/skin.css"];

        config.Profile.configuration.defaultConfig = {
            "basic": {
                "label": "About me",
                "required": true,
                "display": true,
                "access": "everybody",
                "modifyacl": false,
                "permission": "anonymous",
                "order": 0,
                "elements": {
                    "firstName": {
                        "label": "First name",
                        "required": true,
                        "display": true
                    },
                    "lastName": {
                        "label": "Last name",
                        "required": true,
                        "display": true
                    },
                    "preferredName": {
                        "label": "Preferred name",
                        "required": false,
                        "display": true
                    },
                    "role": {
                        "label": "Main role",
                        "required": false,
                        "display": true,
                        "type": "select",
                        "select_elements": {
                            "undergraduatestudent": "Undergraduate student",
                            "graduatestudent": "Graduate student",
                            "postgraduatestudent": "Postgraduate student",
                            "phdstudent": "PhD student",
                            "researchassistant": "Research assistant",
                            "seniorresearcher": "Senior Researcher",
                            "reader": "Reader",
                            "lecturer": "Lecturer",
                            "seniorlecturer": "Senior lecturer",
                            "professor": "Professor",
                            "supportstaff": "Support staff",
                            "other": "Other"
                        }
                    },
                    "summary": {
                        "label": "Biography",
                        "required": false,
                        "display": true,
                        "type": "textarea"
                    },
                    "languages": {
                        "label": "Languages",
                        "required": false,
                        "display": true,
                        "type": "textarea"
                    },
                    "websites": {
                        "label": "Websites",
                        "required": false,
                        "display": true,
                        "type": "textarea"
                    },
                    "tags": {
                        "label": "Keywords",
                        "required": false,
                        "display": true,
                        "type": "textarea",
                        "tagField": true
                    }
                }
            },
            "contact": {
                "label": "Contact information",
                "required": true,
                "display": true,
                "access": "everybody",
                "modifyacl": true,
                "permission": "everyone",
                "order": 1,
                "elements": {
                    "primarycontactaddress": {
                        "label": "Primary address",
                        "required": false,
                        "display": true,
                        "type": "textarea",
                        "example": "Example: Departmental address & room / College address & room / Personal address"
                    },
                    "primarycontactphone": {
                        "label": "Primary phone",
                        "required": false,
                        "display": true,
                        "example": "Example: Departmental phone / College phone / Personal phone or mobile"
                    },
                    "primarycontactfax": {
                        "label": "Primary fax",
                        "required": false,
                        "display": true,
                        "example": "Example: Departmental fax / College fax / Personal fax"
                    },
                    "primarycontactemail": {
                        "label": "Primary email",
                        "required": true,
                        "display": true,
                        "type": "email",
                        "example": "Example: Departmental email address / University email address / College email address / Your personal email address"
                    },
                    "secondarycontactaddress": {
                        "label": "Secondary address",
                        "required": false,
                        "display": true,
                        "type": "textarea",
                        "example": "Example: Departmental address & room / College address & room / Personal address"
                    },
                    "secondarycontactphone": {
                        "label": "Secondary phone",
                        "required": false,
                        "display": true,
                        "example": "Example: Departmental phone / College phone / Personal phone or mobile"
                    },
                    "secondarycontactfax": {
                        "label": "Secondary fax",
                        "required": false,
                        "display": true,
                        "example": "Example: Departmental fax / College fax / Personal fax"
                    },
                    "secondarycontactemail": {
                        "label": "Secondary email",
                        "required": false,
                        "display": true,
                        "type": "email",
                        "example": "Example: Departmental email address / University email address / College email address / Your personal email address"
                    },
                    "tertiarycontactaddress": {
                        "label": "Tertiary address",
                        "required": false,
                        "display": true,
                        "type": "textarea",
                        "example": "Example: Departmental address & room / College address & room / Personal address"
                    },
                    "tertiarycontactphone": {
                        "label": "Tertiary phone",
                        "required": false,
                        "display": true,
                        "example": "Example: Departmental phone / College phone / Personal phone or mobile"
                    },
                    "tertiarycontactfax": {
                        "label": "Tertiary fax",
                        "required": false,
                        "display": true,
                        "example": "Example: Departmental fax / College fax / Personal fax"
                    },
                    "tertiarycontactemail": {
                        "label": "Tertiary email",
                        "required": false,
                        "display": true,
                        "type": "email",
                        "example": "Example: Departmental email address / University email address / College email address / Your personal email address"
                    }
                }
            },
            "academicinterests": {
                "label": "Academic interests",
                "required": true,
                "display": true,
                "access": "everybody",
                "modifyacl": true,
                "permission": "everyone",
                "order": 2,
                "elements": {
                    "engineeringdisciplines": {
                        "label": "Engineering discipline",
                        "required": false,
                        "display": true,
                        "type": "select",
                        "select_elements": {
                            "turbomachineryenergyfluidmechanics": "Turbomachinery, energy and fluid mechanics",
                            "electricalengineering": "Electrical engineering",
                            "mechanicsmaterialsdesign": "Mechanics, materials and design",
                            "civilstructuralenvironmental": "Civil, structural and environmental engineering",
                            "manufacturingmanagement": "Manufacturing and management",
                            "informationengineering": "Information engineering"
                        }
                    },
                    "researchgroup": {
                        "label": "Research group",
                        "required": false,
                        "display": true,
                        "type": "select",
                        "select_elements": {
                            "energy": "Energy",
                            "fluidmechanics": "Fluid Mechanics",
                            "turbomachinery": "Turbomachinery",
                            "solidstateelectronics": "Solid State Electronics and Nanoscale Science",
                            "electronicspowerenergyconversion": "Electronics, Power and Energy Conversion",
                            "photonics": "Photonics Research",
                            "appliedmechanics": "Applied Mechanics",
                            "materialsengineering": "Materials Engineering",
                            "engineeringdesign": "Engineering Design",
                            "geotechnicalenvironmental": "Geotechnical and Environmental",
                            "structures": "Structures",
                            "sustainabledevelopment": "Sustainable Development",
                            "distributedinformationandautomation": "Distributed Information and Automation Laboratory",
                            "decisionsupport": "Decision Support",
                            "economicspolicy": "Economics and Policy",
                            "internationalmanufacturing": "International Manufacturing",
                            "productionprocesses": "Production Processes",
                            "strategyperformance": "Strategy and Performance",
                            "technologymanagement": "Technology Management",
                            "businessresearch": "Business Research",
                            "industrialphotonics": "Industrial Photonics",
                            "innovativemanufacturingresearchcentre": "Innovative Manufacturing Research Centre",
                            "controllaboratory": "Control Laboratory",
                            "machineintelligencelaboratory": "Machine Intelligence Laboratory",
                            "signalprocessingcommunications": "Signal Processing and Communications Laboratory",
                            "computationalbiologicallearning": "Computational and Biological Learning"
                        }
                    },
                    "strategicthemes": {
                        "label": "Strategic themes",
                        "required": false,
                        "display": true,
                        "type": "select",
                        "select_elements": {
                            "energytransporturbaninfrastructure": "Energy, transport and urban infrastructure",
                            "uncertaintyriskresilience": "Uncertainty, risk and resilience",
                            "engineeringforlifescienceshealthcare": "Engineering for life sciences and health care",
                            "inspiringresearchthroughindustrialcollaboration": "Inspiring research through industrial collaboration"
                        }
                    },
                    "academicinterests": {
                        "label": "Academic interests",
                        "required": false,
                        "display": true,
                        "type": "textarea",
                        "example": "For example different research topics you're interested in, even if you're not working on it"
                    },
                    "aboutmyresearchteachingstudies": {
                        "label": "About my research/ teaching/ studies",
                        "required": false,
                        "display": true,
                        "type": "textarea",
                        "example": "A summary or description of your current research, teaching subject or studies"
                    }
                }
            },
            "degreesandpositions": {
                "label": "Degrees and positions",
                "required": false,
                "display": true,
                "access": "everybody",
                "modifyacl": true,
                "permission": "everyone",
                "multiple": true,
                "multipleLabel": "degree or position",
                "order": 3,
                "elements": {
                    "namestudiesorposition": {
                        "label": "Name of studies OR position/role",
                        "required": true,
                        "display": true,
                        "example": "Example: Bachelor in Primary Education/ Teaching Assistant/ Professor..."
                    },
                    "typedegreebusiness": {
                        "label": "Type of degree OR business / department",
                        "required": true,
                        "display": true,
                        "example": "Example: Bachelor/ Master/ PhD/ Microsoft Research Centre"
                    },
                    "schooluniversityoverarchingorganisation": {
                        "label": "School / University OR overarching organisation ",
                        "required": false,
                        "display": true,
                        "example": "Example: Artevelde University Ghent/ University of Cambridge"
                    },
                    "country": {
                        "label": "Country",
                        "required": true,
                        "display": true
                    },
                    "duration": {
                        "label": "Duration",
                        "required": false,
                        "display": true,
                        "example": "Example: 2009-2010"
                    }
                }

            },
            "publications": {
                "label": "Publications",
                "required": false,
                "display": true,
                "access": "everybody",
                "modifyacl": true,
                "permission": "everyone",
                "multiple": true,
                "multipleLabel": "publication",
                "order": 4,
                "elements": {
                    "mainauthor": {
                        "label": "Main author",
                        "required": true,
                        "display": true,
                        "example": "SURNAME, first name; Example: Lindberg, M."
                    },
                    "coauthors": {
                        "label": "Co-authors",
                        "required": false,
                        "display": true,
                        "example": "Example: Martin, J., Sukojev, B."
                    },
                    "bookpaperarticletitle": {
                        "label": "Title of book, paper or article... ",
                        "required": true,
                        "display": true,
                        "example": "Example: Heart disease and rehabilitation"
                    },
                    "magazinejournaltitle": {
                        "label": "Title of magazine or journal...",
                        "required": false,
                        "display": true,
                        "example": "Example: Horizon / Scientists Magazine"
                    },
                    "editionnumber": {
                        "label": "Edition number",
                        "required": false,
                        "display": true,
                        "example": "Example: 3rd (not required if it's the first edition)"
                    },
                    "cityofpublication": {
                        "label": "City of publication",
                        "required": true,
                        "display": true,
                        "example": "Example: Cambridge"
                    },
                    "publishername": {
                        "label": "Publisher's name",
                        "required": true,
                        "display": true,
                        "example": "Example: Cambridge University Press"
                    },
                    "yearofpublication": {
                        "label": "Year of publication",
                        "required": true,
                        "display": true
                    },
                    "numberofpages": {
                        "label": "Number of pages",
                        "required": true,
                        "display": true,
                        "example": "For books / papers: total number of pages; eg. 84p., For articles: pages of article; eg. pp.4-10 or p.6"
                    },
                    "volumenumber": {
                        "label": "Volume number",
                        "required": false,
                        "display": true,
                        "example": "Example: 7 (ie. number 7 of that year )"
                    },
                    "honoursawards": {
                        "label": "Honours &amp; awards",
                        "required": false,
                        "display": true,
                        "example": "Example: If you got nominated for this publication, you could mention it here"
                    }
                }

            },
            "locations": {
                "label": "Categories",
                "required": false,
                "display": true,
                "access": "everybody",
                "modifyacl": true,
                "permission": "everyone",
                "multiple": true,
                "directory": true,
                "multipleLabel": "Add/remove categories",
                "order": 5,
                "elements": {
                    "locationtitle": {
                        "label": "Category",
                        "required": true,
                        "display": true,
                        "type": "location"
                    }
                }
            },
            "collegeandsocieties": {
                "label": "College and societies",
                "required": true,
                "display": true,
                "access": "everybody",
                "modifyacl": false,
                "permission": "everyone",
                "order": 6,
                "elements": {
                    "college": {
                        "label": "College",
                        "required": true,
                        "display": true
                    },
                    "societies": {
                        "label": "Societies and organisations",
                        "required": true,
                        "display": true,
                        "type": "textarea",
                        "example": "Example: Queens' college rowing club, member of the Graduate Union"
                    },
                    "personalinterestsactiviteshobbies": {
                        "label": "Personal interests, activities and hobbies",
                        "required": false,
                        "display": true,
                        "type": "textarea",
                        "example": "Example: reading, classical music, environment and animals, tennis"
                    },
                    "whereimfrom": {
                        "label": "Where I'm originally from",
                        "required": true,
                        "display": true
                    },
                    "freetime": {
                        "label": "When I'm not working for half a day, you can find me here",
                        "required": false,
                        "display": true,
                        "type": "textarea",
                        "example": "Example: Listening to Bach whilst laying in Midsummer Common"
                    }

                }
            }
        }


        config.Directory = {
            turbomachineryenergyfluidmechanics: {
                title: "Turbomachinery, Energy and Fluid Mechanics",
                children: {
                    energy: {
                        title: "Energy"
                    },
                    fluidmechanics: {
                        title: "Fluid Mechanics"
                    },
                    turbomachinery: {
                        title: "Turbomachinery"
                    }
                }
            },
            electricalengineering: {
                title: "Electrical Engineering",
                children: {
                    solidstateelectronicsnanoscalescience: {
                        title: "Solid State Electronics and Nanoscale Science"
                    },
                    electronicspowerenergyconversion: {
                        title: "Electronics, Power and Energy Conversion"
                    },
                    photonicsresearch: {
                        title: "Photonics Research"
                    },
                    centreforadvancedphotonicsandelectronics: {
                        title: "Centre for Advanced Photonics and Electronics"
                    },
                    cambridgeintegratedknowledgecentre: {
                        title: "Cambridge Integrated Knowledge Centre"
                    },
                    cambridgenanosciencecentre: {
                        title: "Cambridge Nanoscience Centre"
                    },
                    doctoraltrainingcentrenanoscience: {
                        title: "Doctoral Training Centre - NanoScience"
                    },
                    doctoraltrainingcentrephotonicssystemsdevelopment: {
                        title: "Doctoral Training Centre - Photonics Systems Development"
                    }
                }
            },
            mechanicsmaterialsdesign: {
                title: "Mechanics, Materials and Design",
                children: {
                    appliedmechanics: {
                        title: "Applied Mechanics"
                    },
                    materialsengineering: {
                        title: "Materials Engineering"
                    },
                    engineeringdesign: {
                        title: "Engineering Design"
                    }
                }
            },
            civilstructuralenvironmentalengineering: {
                title: "Civil, Structural and Environmental Engineering",
                children: {
                    geotechnicalenvironmental: {
                        title: "Geotechnical and Environmental"
                    },
                    structures: {
                        title: "Structures"
                    },
                    sustainabledevelopment: {
                        title: "Sustainable Development"
                    },
                    laingorourkecentreforconstructionengineeringandtechnology: {
                        title: "Laing O'Rourke Centre for Construction Engineering and Technology"
                    }
                }
            },
            manufacturingmanagement: {
                title: "Manufacturing and Management",
                children: {
                    distributedinformationautomationlaboratory: {
                        title: "Distributed Information and Automation Laboratory"
                    },
                    decisionsupport: {
                        title: "Decision Support"
                    },
                    economicspolicy: {
                        title: "Economics and Policy"
                    },
                    internationalmanufacturing: {
                        title: "International Manufacturing"
                    },
                    productionprocesses: {
                        title: "Production Processes"
                    },
                    strategyperformance: {
                        title: "Strategy and Performance"
                    },
                    technologymanagement: {
                        title: "Technology Management"
                    },
                    businessresearch: {
                        title: "Business Research"
                    },
                    industrialphotonics: {
                        title: "Industrial Photonics"
                    },
                    innovativemanufacturingresearchcentre: {
                        title: "Innovative Manufacturing Research Centre"
                    }
                }
            },
            informationengineering: {
                title: "Information Engineering",
                children: {
                    controllaboratory: {
                        title: "Control Laboratory"
                    },
                    machineintelligencelaboratory: {
                        title: "Machine Intelligence Laboratory"
                    },
                    signalprocessingcommunicationslaboratory: {
                        title: "Signal Processing and Communications Laboratory"
                    },
                    computationalbiologicallearning: {
                        title: "Computational and Biological Learning"
                    }
                }
            },
            strategicthemes: {
                title: "Strategic Themes",
                children: {
                    energytransportandurbaninfrastructure: {
                        title: "Energy, transport and urban infrastructure"
                    },
                    uncertaintyriskandresilience: {
                        title: "Uncertainty, risk and resilience"
                    },
                    engineeringforlifesciencesandhealthcare: {
                        title: "Engineering for life sciences and healthcare"
                    },
                    inspiringresearchthroughindustrialcollaboration: {
                        title: "Inspiring research through industrial collaboration"
                    }
                }
            },
            cuedteaching: {
                title: "CUED Teaching",
                children: {
                    engineeringtripospartia: {
                        title: "Engineering Tripos Part IA"
                    },
                    engineeringtripospartib: {
                        title: "Engineering Tripos Part IB"
                    },
                    engineeringtripospartiia: {
                        title: "Engineering Tripos Part IIA"
                    },
                    engineeringtripospartiib: {
                        title: "Engineering Tripos Part IIB"
                    },
                    manufacturingengineeringtripospartiia: {
                        title: "Manufacturing Engineering Tripos Part IIA"
                    },
                    manufacturingengineeringtripospartiib: {
                        title: "Manufacturing Engineering Tripos Part IIB"
                    },
                    mphilinnuclearenergy: {
                        title: "MPhil in Nuclear Energy"
                    },
                    mphilinindustrialsystemsmanufactureandmanagement: {
                        title: "MPhil in Industrial Systems, Manufacture and Management"
                    },
                    mphilinenergytechnologies: {
                        title: "MPhil in Energy Technologies"
                    },
                    mphilininterdisciplinarydesignforthebuiltenvironment: {
                        title: "MPhil in Interdisciplinary Design for the Built Environment"
                    },
                    mphilinengineeringforsustainabledevelopment: {
                        title: "MPhil in Engineering for Sustainable Development"
                    },
                    mphilinconstructionengineering: {
                        title: "MPhil in Construction Engineering"
                    },
                    mresinphotonicssystemsdevelopment: {
                        title: "MRes in Photonics Systems Development"
                    }
                }
            }
        }

        // Remove the Sign Up link:
        config.Navigation.splice(4,1);

        // Set UK style dates:
        config.defaultLanguage = "en_GB";

        // Prevent users changing their internal passwords through the UI:
        config.allowPasswordChange = false;

        // Make all content (uploaded to or created in Sakai OAE) visible to
        // logged in users only by default.
        config.Permissions.Content.defaultaccess = "everyone";
        config.Permissions.Documents.defaultaccess = "everyone";

        // Set up Raven / Friends links:
        config.Authentication.allowInternalAccountCreation = false;
        config.Authentication.internal = false;
        config.Authentication.external = [{
                    label: "Raven",
                    url: "https://ucamoae.caret.cam.ac.uk/system/ucam/auth/raven"
                }, {    
                    label: "Friends",
                    url: "https://ucamoae.caret.cam.ac.uk/system/ucam/auth/friends"
                }];

        // Disable JS debugging:
        config.displayDebugInfo = false;

        // End custom configuration


    return config;
});
