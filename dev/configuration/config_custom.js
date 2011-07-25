define(["config/config"], function(config) {

    // Custom CSS Files to load in
    config.skinCSS = ["/dev/skins/default/skin.css"];
    
    config.Profile.configuration.defaultConfig = {
        "basic": {
            "label": "About me",
            "required": true,
            "display": true,
            "access": "everybody",
            "modifyacl": false,
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
                        "undergraduate_student": "Undergraduate student",
                        "graduate_student": "Graduate student",
                        "postgraduate_student": "Postgraduate student",
                        "phd_student": "PhD student",
                        "research_assistant": "Research assistant",
                        "senior_researcher": "Senior Researcher",
                        "reader": "Reader",
                        "lecturer": "Lecturer",
                        "senior_lecturer": "Senior lecturer",
                        "professor": "Professor",
                        "support_staff": "Support staff",
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
            "order": 1,
            "elements": {
                "primary_contact_address": {
                    "label": "Primary address",
                    "required": false,
                    "display": true,
                    "type": "textarea",
                    "example": "For example: Departmental address & room / College address & room / Personal address"
                },
                "primary_contact_phone": {
                    "label": "Primary phone",
                    "required": false,
                    "display": true,
                    "example": "For example: Departmental phone / College phone / Personal phone or mobile"
                },
                "primary_contact_fax": {
                    "label": "Primary fax",
                    "required": false,
                    "display": true,
                    "example": "For example: Departmental fax / College fax / Personal fax"
                },
                "primary_contact_email": {
                    "label": "Primary email",
                    "required": true,
                    "display": true,
                    "type": "email",
                    "example": "For example: Departmental email address / University email address / College email address / Your personal email address"
                },
                "secondary_contact_address": {
                    "label": "Secondary address",
                    "required": false,
                    "display": true,
                    "type": "textarea",
                    "example": "For example: Departmental address & room / College addres & room / Personal address"
                },
                "secondary_contact_phone": {
                    "label": "Secondary phone",
                    "required": false,
                    "display": true,
                    "example": "For example: Departmental phone / College phone / Personal phone or mobile"
                },
                "secondary_contact_fax": {
                    "label": "Secondary fax",
                    "required": false,
                    "display": true,
                    "example": "For example: Departmental fax / College fax / Personal fax"
                },
                "secondary_contact_email": {
                    "label": "Secondary email",
                    "required": false,
                    "display": true,
                    "type": "email",
                    "example": "For example: Departmental email address / University email address / College email address / Your personal email address"
                },
                "tertiary_contact_address": {
                    "label": "Tertiary address",
                    "required": false,
                    "display": true,
                    "type": "textarea",
                    "example": "For example: Departmental address & room / College addres & room / Personal address"
                },
                "tertiary_contact_phone": {
                    "label": "Tertiary phone",
                    "required": false,
                    "display": true,
                    "example": "For example: Departmental phone / College phone / Personal phone or mobile"
                },
                "tertiary_contact_fax": {
                    "label": "Tertiary fax",
                    "required": false,
                    "display": true,
                    "example": "For example: Departmental fax / College fax / Personal fax"
                },
                "tertiary_contact_email": {
                    "label": "Tertiary email",
                    "required": false,
                    "display": true,
                    "type": "email",
                    "example": "For example: Departmental email address / University email address / College email address / Your personal email address"
                }
            }
        },
        "academicinterests": {
            "label": "Academic interests",
            "required": true,
            "display": true,
            "access": "everybody",
            "modifyacl": true,
            "order": 2,
            "elements": {
                "engineering_disciplines": {
                    "label": "Engineering discipline",
                    "required": false,
                    "display": true,
                    "type": "select",
                    "select_elements": {
                        "turbomachinery_energy_fluid_mechanics": "Turbomachinery, energy and fluid mechanics",
                        "electrical_engineering": "Electrical engineering",
                        "mechanics_materials_design": "Mechanics, materials and design",
                        "civil_structural_environmental": "Civil, structural and environmental engineering",
                        "manufacturing_management": "Manufacturing and management",
                        "information_engineering": "Information engineering"
                    }
                },
                "research_group": {
                    "label": "Research group",
                    "required": false,
                    "display": true,
                    "type": "select",
                    "select_elements": {
                        "energy": "Energy",
                        "fluid_mechanics": "Fluid Mechanics",
                        "turbomachinery": "Turbomachinery",
                        "solid_state_electronics": "Solid State Electronics and Nanoscale Science",
                        "electronics_power_energy_conversion": "Electronics, Power and Energy Conversion",
                        "photonics": "Photonics Research",
                        "applied_mechanics": "Applied Mechanics",
                        "materials_engineering": "Materials Engineering",
                        "engineering_design": "Engineering Design",
                        "geotechnical_environmental": "Geotechnical and Environmental",
                        "structures": "Structures",
                        "sustainable_development": "Sustainable Development",
                        "distributed_information_and_automation": "Distributed Information and Automation Laboratory",
                        "decision_support": "Decision Support",
                        "economics_policy": "Economics and Policy",
                        "international_manufacturing": "International Manufacturing",
                        "production_processes": "Production Processes",
                        "strategy_performance": "Strategy and Performance",
                        "technology_management": "Technology Management",
                        "business_research": "Business Research",
                        "industrial_photonics": "Industrial Photonics",
                        "innovative_manufacturing_research_centre": "Innovative Manufacturing Research Centre",
                        "control_laboratory": "Control Laboratory",
                        "machine_intelligence_laboratory": "Machine Intelligence Laboratory",
                        "signal_processing_communications": "Signal Processing and Communications Laboratory",
                        "computational_biological_learning": "Computational and Biological Learning"
                    }
                },
                "strategic_themes": {
                    "label": "Strategic themes",
                    "required": false,
                    "display": true,
                    "type": "select",
                    "select_elements": {
                        "energy_transport_urban_infrastructure": "Energy, transport and urban infrastructure",
                        "uncertainty_risk_resilience": "Uncertainty, risk and resilience",
                        "engineering_for_life_sciences_health_care": "Engineering for life sciences and health care",
                        "inspiring_research_through_industrial_collaboration": "Inspiring research through industrial collaboration"
                    }
                },
                "academic_interests": {
                    "label": "Academic interests",
                    "required": false,
                    "display": true,
                    "type": "textarea",
                    "example": "For example different research topics you're interested in, even if you're not working on it"
                },
                "about_my_research_teaching_studies": {
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
            "multiple": true,
            "multipleLabel": "Add another degree or position",
            "order": 3,
            "elements": {
                "Name_studies_or_position": {
                    "label": "Name of studies OR position/role",
                    "required": true,
                    "display": true,
                    "example": "For example: Bachelor in Primary Education/ Teaching Assistant/ Professor..."
                },
                "type_degree_business": {
                    "label": "Type of degree OR business/department",
                    "required": true,
                    "display": true,
                    "example": "For example: Bachelor/ Master/ PhD/ Microsoft Research Centre"
                },
                "school_university_overarching_organisation": {
                    "label": "School/ University OR overarching organisation ",
                    "required": false,
                    "display": true,
                    "example": "For example: Artevelde University Ghent/ University of Cambridge"
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
                    "example": "For example: 2009-2010"
                }
            }
        
        },
        "publications": {
            "label": "Publications",
            "required": false,
            "display": true,
            "access": "everybody",
            "modifyacl": true,
            "multiple": true,
            "multipleLabel": "Add another publication",
            "order": 4,
            "elements": {
                "mainauthor": {
                    "label": "Main author",
                    "required": true,
                    "display": true,
                    "example": "SURNAME, first name; For example: Lindberg, M."
                },
                "co_authors": {
                    "label": "Co-authors",
                    "required": false,
                    "display": true,
                    "example": "For example: Martin, J., Sukojev, B."
                },
                "book_paper_article_title": {
                    "label": "Title of book/ Paper/ Article/... ",
                    "required": true,
                    "display": true,
                    "example": "For example: Heart disease and rehabilitation"
                },
                "magazine_journal_title": {
                    "label": "Title of magazine/ journal/...",
                    "required": false,
                    "display": true,
                    "example": "For example: Horizon/ Scientists Magazine"
                },
                "edition_number": {
                    "label": "Edition number",
                    "required": false,
                    "display": true,
                    "example": "For example: 3rd (not required if it's the first edition)"
                },
                "city_of_publication": {
                    "label": "City of publication",
                    "required": true,
                    "display": true,
                    "example": "For example: Cambridge"
                },
                "publisher_name": {
                    "label": "Publisher's name",
                    "required": true,
                    "display": true,
                    "example": "For example: Cambridge University Press"
                },
                "year_of_publication": {
                    "label": "Year of publication",
                    "required": true,
                    "display": true
                },
                "number_of_pages": {
                    "label": "Number of pages",
                    "required": true,
                    "display": true,
                    "example": "For books/ papers: total number of pages; eg. 84p., For articles: pages of article; eg. pp.4-10 or p.6"
                },
                "volume_number": {
                    "label": "Volume number",
                    "required": false,
                    "display": true,
                    "example": "For example: 7 (ie. number 7 of that year )"
                },
                "honours_awards": {
                    "label": "Honours and awards",
                    "required": false,
                    "display": true,
                    "example": "For example: If you got nominated for this publication, you could mention it here"
                }
            }
        
        },
        "locations": {
            "label": "Categories",
            "required": false,
            "display": true,
            "access": "everybody",
            "modifyacl": true,
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
                    "example": "For example: Queens' college rowing club, member of the Graduate Union"
                },
                "personal_interests_activites_hobbies": {
                    "label": "Personal interests, activities and hobbies",
                    "required": false,
                    "display": true,
                    "type": "textarea",
                    "example": "For example: reading, classical music, environment and animals, tennis"
                },
                "where_im_from": {
                    "label": "Where I'm originally from",
                    "required": true,
                    "display": true
                },
                "free_time": {
                    "label": "When I'm not working for half a day, you can find me here",
                    "required": false,
                    "display": true,
                    "type": "textarea",
                    "example": "For example: Listening to Bach whilst laying in Midsummer Common"
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
                }
            }
        },
        manufacturingmanagement: {
            title: "Manufactoring and Management",
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
        }
    }

    return config;
});
