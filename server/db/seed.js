const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/db');

async function seed() {
  const client = await pool.connect();
  console.log('Connected to PostgreSQL (Neon). Initializing schema and seed data...');

  try {
    // 1. Run schema migration
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schemaSql);
    console.log('✓ Executed schema.sql (tables dropped and created cleanly).');

    // 2. Insert AZ-900 Flagship Syllabus
    const syllabusRes = await client.query(`
      INSERT INTO syllabi (title, code, description, is_flagship)
      VALUES (
        'Microsoft Azure Fundamentals (Unofficial Prep)',
        'AZ-900',
        'Official skills outline covering Cloud Concepts, Azure Architecture & Services, and Azure Management & Governance.',
        true
      )
      RETURNING id, title;
    `);
    const syllabusId = syllabusRes.rows[0].id;
    console.log(`✓ Seeded Flagship Syllabus: "${syllabusRes.rows[0].title}" (ID: ${syllabusId})`);

    // 3. Insert 3 Official Domains
    const domainData = [
      {
        name: 'Describe Cloud Concepts',
        weight_min: 25,
        weight_max: 30,
        description: 'Cloud computing principles, benefits, economics (CapEx/OpEx), and deployment models (Public, Private, Hybrid).'
      },
      {
        name: 'Describe Azure Architecture and Services',
        weight_min: 35,
        weight_max: 40,
        description: 'Core physical infrastructure (Regions, Availability Zones), compute, storage, networking, and identity.'
      },
      {
        name: 'Describe Azure Management and Governance',
        weight_min: 30,
        weight_max: 35,
        description: 'Cost management, tagging, Azure Policy, RBAC, Resource Locks, and compliance.'
      }
    ];

    const domainIds = [];
    for (const d of domainData) {
      const res = await client.query(`
        INSERT INTO domains (syllabus_id, name, weight_min, weight_max, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name;
      `, [syllabusId, d.name, d.weight_min, d.weight_max, d.description]);
      domainIds.push(res.rows[0].id);
    }
    console.log(`✓ Seeded ${domainIds.length} Official Domains.`);

    // 4. Seed 6 High-Yield Scenario Questions (2 per domain)
    const questions = [
      // Domain 1: Cloud Concepts
      {
        domain_id: domainIds[0],
        topic_tag: 'CapEx vs OpEx',
        scenario: 'A retail startup in Nairobi is launching an e-commerce platform and wants to minimize upfront infrastructure costs while only paying for compute power when customers are actively placing orders.',
        question: 'Which cloud economic concept directly supports this strategy?',
        options: [
          {
            id: 'A',
            text: 'Capital Expenditure (CapEx)',
            is_correct: false,
            autopsy: {
              why_wrong: 'CapEx requires paying upfront lump sums for physical hardware and server racks before using them, which drains startup liquidity.',
              right_scenario: 'When buying physical on-premises servers or building a private data center that amortizes over 5-10 years.',
              trap: 'Confusing traditional IT spending with dynamic cloud elasticity.'
            }
          },
          {
            id: 'B',
            text: 'Operational Expenditure (OpEx) with Consumption-Based Pricing',
            is_correct: true,
            autopsy: {
              why_wrong: 'N/A - This is the correct choice.',
              right_scenario: 'Paying only for the compute cycles and resources used on-demand, with zero upfront capital hardware costs.',
              trap: 'N/A'
            }
          },
          {
            id: 'C',
            text: 'High Availability (HA)',
            is_correct: false,
            autopsy: {
              why_wrong: 'High availability ensures minimum downtime and keeps services running, but it is an operational reliability feature, not a cost/accounting expenditure model.',
              right_scenario: 'When architecting multiple instances across availability zones to prevent server downtime.',
              trap: 'Assuming all cloud benefits are financial.'
            }
          },
          {
            id: 'D',
            text: 'Disaster Recovery (DR)',
            is_correct: false,
            autopsy: {
              why_wrong: 'Disaster Recovery focuses on restoring operations after catastrophic failures (e.g., floods, regional outages), not consumption billing.',
              right_scenario: 'When replicating backups to a secondary paired region.',
              trap: 'Thinking business continuity dictates cloud billing.'
            }
          }
        ],
        context_translations: {
          standard: 'Operational Expenditure (OpEx) enables organizations to pay for cloud services as an ongoing operating expense without upfront infrastructure investments.',
          african_context: 'Think of CapEx like buying your own 14-seater Matatu cash before starting a transport business. OpEx is like paying daily commuter fare only on days you actually travel—zero capital sunk into buying the vehicle!',
          sheng: 'CapEx ni kubuy gari yako mzima kabla biashara ianze. OpEx ni kulipa fare ya mat ya Super Metro siku ile tu unasafiri—huna stress ya maintenance ya engine!'
        },
        difficulty: 'medium'
      },
      {
        domain_id: domainIds[0],
        topic_tag: 'Cloud Deployment Models',
        scenario: 'A commercial bank headquartered in Lagos is subject to strict central bank regulations requiring core customer banking ledger data to remain in on-premises physical vaults, while its mobile loan approval AI app needs to scale dynamically on public cloud servers during salary payment weekends.',
        question: 'Which cloud deployment model must the bank implement to satisfy both compliance and scalability requirements?',
        options: [
          {
            id: 'A',
            text: 'Public Cloud',
            is_correct: false,
            autopsy: {
              why_wrong: 'Public cloud hosts all data in multi-tenant cloud provider data centers, violating the bank\'s sovereign on-premises ledger requirement.',
              right_scenario: 'When deploying a consumer web portal or non-regulated public service with zero physical server maintenance.',
              trap: 'Focusing only on dynamic scaling while ignoring sovereign compliance regulations.'
            }
          },
          {
            id: 'B',
            text: 'Private Cloud',
            is_correct: false,
            autopsy: {
              why_wrong: 'A pure private cloud remains entirely within the company\'s own data center, which prevents seamless instant burst-scaling to public cloud resources.',
              right_scenario: 'When an organization has unlimited capital and mandates 100% isolated internal infrastructure.',
              trap: 'Assuming maximum compliance automatically rules out cloud connectivity.'
            }
          },
          {
            id: 'C',
            text: 'Hybrid Cloud',
            is_correct: true,
            autopsy: {
              why_wrong: 'N/A - This is the correct choice.',
              right_scenario: 'Combining on-premises private infrastructure (for sensitive customer ledger data) with public cloud scalability (for high-traffic loan apps).',
              trap: 'N/A'
            }
          },
          {
            id: 'D',
            text: 'Multi-Cloud',
            is_correct: false,
            autopsy: {
              why_wrong: 'Multi-cloud refers to using two or more public cloud vendors (e.g. Azure + AWS), not bridging on-premises hardware with the public cloud.',
              right_scenario: 'When avoiding vendor lock-in by splitting workloads across Azure and GCP.',
              trap: 'Confusing cross-vendor cloud usage with on-premise hybrid integration.'
            }
          }
        ],
        context_translations: {
          standard: 'A Hybrid Cloud seamlessly connects an organization\'s private on-premises datacenter with public cloud environments to ensure compliance and elastic scaling.',
          african_context: 'Like keeping your land title deeds and gold in a secure bank safe deposit box (Private), but using M-Pesa on your phone for daily fast transactions in the open market (Public). Hybrid connects both worlds safely!',
          sheng: 'Ni kama kuweka cheti ya shamba kwa sanduku ya chuma kwa keja (Private), lakini wallet ya kila siku ni M-Pesa kwa simu (Public). Hybrid inachanganya zote mbili fiti!'
        },
        difficulty: 'medium'
      },

      // Domain 2: Azure Architecture and Services
      {
        domain_id: domainIds[1],
        topic_tag: 'Regions & Availability Zones',
        scenario: 'An agricultural logistics company running cold-storage monitoring across East Africa needs to ensure its IoT telemetry database remains online even if an entire physical data center building suffers a complete power and cooling blackout. However, the data must remain within the same geographic legal boundary.',
        question: 'What Azure architectural component should the engineering team deploy across to achieve datacenter-level fault tolerance within a single region?',
        options: [
          {
            id: 'A',
            text: 'Availability Sets',
            is_correct: false,
            autopsy: {
              why_wrong: 'Availability Sets only protect against hardware and rack/power supply failures within a single data center building. If the whole building loses power, all VMs go down.',
              right_scenario: 'When protecting against single server rack or switch failures inside one datacenter.',
              trap: 'Confusing rack-level redundancy with independent facility redundancy.'
            }
          },
          {
            id: 'B',
            text: 'Availability Zones',
            is_correct: true,
            autopsy: {
              why_wrong: 'N/A - This is the correct choice.',
              right_scenario: 'Deploying across physically separate datacenter facilities within the same Azure region, each with independent power, cooling, and networking.',
              trap: 'N/A'
            }
          },
          {
            id: 'C',
            text: 'Azure Geographies',
            is_correct: false,
            autopsy: {
              why_wrong: 'Azure Geographies are massive geopolitical boundaries (e.g., Africa, Europe) containing multiple regions, not datacenter deployment targets.',
              right_scenario: 'When ensuring data residency compliance across continental borders.',
              trap: 'Picking the largest geographic scope instead of the datacenter resilience layer.'
            }
          },
          {
            id: 'D',
            text: 'Resource Groups',
            is_correct: false,
            autopsy: {
              why_wrong: 'Resource Groups are purely logical management containers for organizing Azure resources, with no physical redundancy or high availability capabilities.',
              right_scenario: 'When grouping related resources (VMs, DBs, VNets) for billing and RBAC access control.',
              trap: 'Mistaking administrative groupings for physical infrastructure redundancy.'
            }
          }
        ],
        context_translations: {
          standard: 'Azure Availability Zones are physically separated locations within an Azure region, each equipped with independent power, cooling, and networking.',
          african_context: 'If KPLC power cuts out in Upper Hill Nairobi, your business survives because your backup servers are in Westlands and Industrial Area on totally different substations. That is what Availability Zones do inside one city/region!',
          sheng: 'Stima ikikatika mtaa ya Roysambu, shop yako ya CBD na Eastleigh bado ziko na generator na ziko chonjo. Availability Zones zinakuepusha na giza ya KPLC!'
        },
        difficulty: 'medium'
      },
      {
        domain_id: domainIds[1],
        topic_tag: 'Azure Compute',
        scenario: 'A developer at an agritech company wants to run a background script that triggers only when a farmer uploads a crop pest photo to storage, analyzes the photo in 3 seconds, and immediately stops without paying for any idle servers or managing OS patches.',
        question: 'Which Azure compute service is best suited for this event-driven, serverless requirement?',
        options: [
          {
            id: 'A',
            text: 'Azure Virtual Machines (VMs)',
            is_correct: false,
            autopsy: {
              why_wrong: 'Virtual Machines are IaaS. You must configure the OS, manage security patches, and pay 24/7 even when no farmers are uploading photos.',
              right_scenario: 'When migrating legacy Windows Server apps requiring full operating system and kernel control.',
              trap: 'Choosing the most well-known compute service for a simple event-driven function.'
            }
          },
          {
            id: 'B',
            text: 'Azure App Service',
            is_correct: false,
            autopsy: {
              why_wrong: 'App Service is PaaS for web applications and APIs, requiring an App Service Plan where you pay for underlying instance allocation continuously.',
              right_scenario: 'When hosting an interactive REST API or React web portal with consistent HTTP traffic.',
              trap: 'Confusing managed web hosting (PaaS) with pure event-driven serverless compute.'
            }
          },
          {
            id: 'C',
            text: 'Azure Functions',
            is_correct: true,
            autopsy: {
              why_wrong: 'N/A - This is the correct choice.',
              right_scenario: 'Executing lightweight code only when triggered by events (e.g., blob upload, queue message) with automatic scale-to-zero and microsecond billing.',
              trap: 'N/A'
            }
          },
          {
            id: 'D',
            text: 'Azure Virtual Desktop',
            is_correct: false,
            autopsy: {
              why_wrong: 'Azure Virtual Desktop provides cloud-hosted Windows desktop sessions for end users, not code execution.',
              right_scenario: 'When providing remote enterprise employees with secure virtual office PC environments.',
              trap: 'Selecting a desktop service due to \'Virtual\' in the name.'
            }
          }
        ],
        context_translations: {
          standard: 'Azure Functions provides serverless event-driven compute that runs code in response to events and automatically scales without provisioning or managing servers.',
          african_context: 'Like hiring a bodaboda rider only when a customer orders a parcel. You pay for that 10-minute trip and nothing more—instead of buying a motorcycle and paying a full-time rider who sits idle all afternoon!',
          sheng: 'Ni kama kuita nduthi ya parcel ukihitaji tu. Unamlipa punch moja ya trip anasepa, kuliko kubuy pikipiki yako ulipe dereva mwezi mzima akiwa ameketi tu base!'
        },
        difficulty: 'medium'
      },

      // Domain 3: Azure Management and Governance
      {
        domain_id: domainIds[2],
        topic_tag: 'Azure Policy vs RBAC',
        scenario: 'The security audit team at a fintech firm discovers that junior developers with Contributor access have been accidentally deploying expensive GPU virtual machines in the US East region instead of the compliant South Africa North region. The team must enforce a hard technical guardrail that prevents any user—regardless of permissions—from creating resources outside South Africa.',
        question: 'Which Azure governance tool should be used to enforce this regional restriction?',
        options: [
          {
            id: 'A',
            text: 'Role-Based Access Control (RBAC)',
            is_correct: false,
            autopsy: {
              why_wrong: 'RBAC controls WHO can do WHAT actions (e.g., can Alice create VMs?). It cannot evaluate resource properties like which region a VM is being deployed into.',
              right_scenario: 'When granting a developer \'Contributor\' rights to a resource group while denying them \'Owner\' permissions.',
              trap: 'Thinking user authorization (RBAC) inspects resource configuration settings and geographic boundaries.'
            }
          },
          {
            id: 'B',
            text: 'Azure Policy',
            is_correct: true,
            autopsy: {
              why_wrong: 'N/A - This is the correct choice.',
              right_scenario: 'Enforcing organizational standards, compliance guardrails, and allowed regions or VM SKUs across all resource deployments.',
              trap: 'N/A'
            }
          },
          {
            id: 'C',
            text: 'Azure Resource Locks',
            is_correct: false,
            autopsy: {
              why_wrong: 'Resource Locks prevent accidental deletion (CannotDelete) or modification (ReadOnly) of existing resources; they do not restrict new deployments or enforce regions.',
              right_scenario: 'When locking a critical production database so no administrator can accidentally delete it.',
              trap: 'Confusing preventing resource deletion with restricting resource creation properties.'
            }
          },
          {
            id: 'D',
            text: 'Microsoft Defender for Cloud',
            is_correct: false,
            autopsy: {
              why_wrong: 'Defender for Cloud provides threat detection, vulnerability assessments, and security posture monitoring, but is not the native rule-enforcement engine for deployment guardrails.',
              right_scenario: 'When scanning VMs for unpatched operating system vulnerabilities and malware.',
              trap: 'Assuming security compliance monitoring actively blocks deployment templates.'
            }
          }
        ],
        context_translations: {
          standard: 'Azure Policy enforces rules and effects over your resources to ensure compliance with corporate standards and service-level agreements.',
          african_context: 'RBAC is the gate pass that lets a driver enter a bus park (who has access). Azure Policy is the speed bump and height barrier at the gate that physically stops overloaded trucks from entering, no matter who is driving!',
          sheng: 'RBAC ni pass ya gate kuonyesha wewe ni dere wa sacco. Azure Policy ni barrier ya chuma inayokataa gari kubwa kuingia mtaani hata dere akilia aje!'
        },
        difficulty: 'medium'
      },
      {
        domain_id: domainIds[2],
        topic_tag: 'Cost Management & Tags',
        scenario: 'A multinational media house uses a single Azure subscription for five different TV and radio stations. At the end of the month, the CFO cannot tell how much cloud storage was consumed specifically by the "Radio Maisha" podcast team versus the "KTN News" live stream team.',
        question: 'What Azure management practice should the IT team implement to categorize and allocate billing costs to specific departments?',
        options: [
          {
            id: 'A',
            text: 'Resource Tags',
            is_correct: true,
            autopsy: {
              why_wrong: 'N/A - This is the correct choice.',
              right_scenario: 'Applying metadata key-value pairs (e.g., Department: RadioMaisha, CostCenter: 402) to resources for granular cost allocation and grouping.',
              trap: 'N/A'
            }
          },
          {
            id: 'B',
            text: 'Azure ExpressRoute',
            is_correct: false,
            autopsy: {
              why_wrong: 'ExpressRoute is a high-speed private fiber connection between on-premises datacenters and Azure, completely unrelated to billing or metadata.',
              right_scenario: 'When connecting a corporate office directly to Azure bypassing the public internet.',
              trap: 'Selecting a connectivity product that has nothing to do with cost attribution.'
            }
          },
          {
            id: 'C',
            text: 'Azure Bastion',
            is_correct: false,
            autopsy: {
              why_wrong: 'Azure Bastion provides secure, browser-based RDP/SSH access to VMs without public IP addresses.',
              right_scenario: 'When sysadmins need to safely log into Linux and Windows VMs without exposing port 22 or 3389.',
              trap: 'Confusing administrative access with financial accounting.'
            }
          },
          {
            id: 'D',
            text: 'Azure Blueprints',
            is_correct: false,
            autopsy: {
              why_wrong: 'Azure Blueprints packages environments (Resource Groups, Policies, RBAC, ARM templates) for repeatable environment creation, not resource tagging.',
              right_scenario: 'When automating standard regulatory compliance landing zones across multiple new enterprise subscriptions.',
              trap: 'Thinking an environment deployment tool is needed just to add department labels.'
            }
          }
        ],
        context_translations: {
          standard: 'Resource Tags are key-value metadata pairs applied to Azure resources to support logical organization, cost allocation, and department billing reporting.',
          african_context: 'Like putting colored stickers or labels on farm produce sacks at the wholesale market—Green tags for Kiambu potatoes, Yellow for Nakuru carrots—so the market cashier knows exactly who gets paid!',
          sheng: 'Ni kama kupiga label kwa kila mzigo kwa matatu: mzigo ya Omondi una sticker ya blue, ya Wanjiku red. Konda akipiga hesabu jioni anajua nani alilipa nini bila kubishana!'
        },
        difficulty: 'medium'
      }
    ];

    const questionIds = [];
    for (const q of questions) {
      const qRes = await client.query(`
        INSERT INTO quiz_questions (domain_id, topic_tag, scenario, question, options, context_translations, difficulty)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, topic_tag;
      `, [q.domain_id, q.topic_tag, q.scenario, q.question, JSON.stringify(q.options), JSON.stringify(q.context_translations), q.difficulty]);
      questionIds.push(qRes.rows[0].id);
    }
    console.log(`✓ Seeded ${questionIds.length} High-Yield Scenario Questions.`);

    // 5. Seed 3 Pre-Seeded Weak-Spot Flashcards for "demo-learner"
    const demoUser = 'demo-learner';
    const flashcardData = [
      {
        domain_id: domainIds[0],
        topic_tag: 'CapEx vs OpEx',
        front_prompt: 'What is the fundamental difference between CapEx and OpEx in cloud computing?',
        back_explanation: 'CapEx requires upfront physical hardware spending. OpEx is ongoing pay-as-you-go consumption with zero upfront hardware costs.',
        context_notes: {
          standard: 'CapEx is capital expense; OpEx is operational pay-as-you-go expense.',
          african_analogy: 'CapEx is buying the bus cash; OpEx is paying per trip.',
          sheng: 'CapEx ni kubuy gari cash; OpEx ni kulipa fare ya matatu kila siku.'
        },
        interval_days: 1,
        repetition_count: 1,
        ease_factor: 2.50
      },
      {
        domain_id: domainIds[1],
        topic_tag: 'Regions & Availability Zones',
        front_prompt: 'What protection does an Azure Availability Zone provide that an Availability Set cannot?',
        back_explanation: 'Availability Zones protect against an entire data center facility outage (independent power, cooling, network). Availability Sets only protect against rack/server hardware failure inside a single building.',
        context_notes: {
          standard: 'Zones provide datacenter-level fault tolerance; Sets provide rack-level tolerance.',
          african_analogy: 'Sets are backup plugs in the same shop; Zones are shops in different estates with separate KPLC lines.',
          sheng: 'Sets ni kuweka generator kwa duka moja; Zones ni branches tofauti kama Westlands na CBD.'
        },
        interval_days: 1,
        repetition_count: 1,
        ease_factor: 2.30
      },
      {
        domain_id: domainIds[2],
        topic_tag: 'Azure Policy vs RBAC',
        front_prompt: 'When should you use Azure Policy instead of Role-Based Access Control (RBAC)?',
        back_explanation: 'Use RBAC to define WHO has permissions to act. Use Azure Policy to enforce WHAT properties and compliance rules (like allowed regions or naming conventions) the resources must follow.',
        context_notes: {
          standard: 'RBAC focuses on user identity and permissions; Policy focuses on resource state and compliance.',
          african_analogy: 'RBAC is checking driver identity at the entrance; Policy is the height bar that prevents big trucks regardless of who drives.',
          sheng: 'RBAC ni kitambulisho ya dereva; Policy ni bump kwa gate inayozuia gari kubwa kuingia.'
        },
        interval_days: 1,
        repetition_count: 0,
        ease_factor: 2.50
      }
    ];

    for (const f of flashcardData) {
      await client.query(`
        INSERT INTO flashcards (user_id, domain_id, topic_tag, front_prompt, back_explanation, context_notes, interval_days, repetition_count, ease_factor)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
      `, [demoUser, f.domain_id, f.topic_tag, f.front_prompt, f.back_explanation, JSON.stringify(f.context_notes), f.interval_days, f.repetition_count, f.ease_factor]);
    }
    console.log(`✓ Seeded ${flashcardData.length} Weak-Spot Flashcards for "${demoUser}".`);

    // 6. Seed Realistic Historical User Attempts (7 correct / 11 attempts = ~63.6% ~ 64% Readiness)
    const attempts = [
      { qIdx: 0, opt: 'B', correct: true },
      { qIdx: 1, opt: 'C', correct: true },
      { qIdx: 2, opt: 'A', correct: false }, // Missed Availability Zones (picked Sets)
      { qIdx: 2, opt: 'B', correct: true },
      { qIdx: 3, opt: 'A', correct: false }, // Missed Functions (picked VMs)
      { qIdx: 3, opt: 'C', correct: true },
      { qIdx: 4, opt: 'A', correct: false }, // Missed Policy (picked RBAC)
      { qIdx: 4, opt: 'C', correct: false }, // Missed Policy (picked Locks)
      { qIdx: 4, opt: 'B', correct: true },
      { qIdx: 5, opt: 'A', correct: true },
      { qIdx: 5, opt: 'A', correct: true },
    ];

    for (const a of attempts) {
      await client.query(`
        INSERT INTO user_attempts (user_id, question_id, selected_option_id, is_correct)
        VALUES ($1, $2, $3, $4);
      `, [demoUser, questionIds[a.qIdx], a.opt, a.correct]);
    }
    const correctCount = attempts.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / attempts.length) * 100);
    console.log(`✓ Seeded ${attempts.length} User Attempts (${correctCount} correct, baseline readiness: ${accuracy}%).`);

    // 7. Seed Initial Study Plan for "demo-learner"
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 14); // 2 weeks out
    const planSchedule = [
      { day: 1, topic: 'Cloud Concepts (CapEx vs OpEx, Cloud Benefits)', status: 'completed' },
      { day: 2, topic: 'Cloud Models: Public, Private & Hybrid', status: 'completed' },
      { day: 3, topic: 'Azure Architecture: Regions & Availability Zones', status: 'in_progress' },
      { day: 4, topic: 'Azure Compute: VMs vs App Service vs Functions', status: 'pending' },
      { day: 5, topic: 'Azure Storage & Networking Fundamentals', status: 'pending' },
      { day: 6, topic: 'Identity, Access & Security (Microsoft Entra ID)', status: 'pending' },
      { day: 7, topic: 'Azure Governance: Policy, RBAC & Locks', status: 'pending' },
      { day: 8, topic: 'Cost Management & Resource Tagging', status: 'pending' },
      { day: 9, topic: 'Weak Area Revision (Flashcard Drill)', status: 'pending' },
      { day: 10, topic: 'Full AZ-900 Simulation Sprint', status: 'pending' }
    ];

    await client.query(`
      INSERT INTO study_plans (user_id, syllabus_id, target_exam_date, daily_hours, schedule_data)
      VALUES ($1, $2, $3, $4, $5);
    `, [demoUser, syllabusId, targetDate, 1.5, JSON.stringify(planSchedule)]);
    console.log(`✓ Seeded Study Plan for "${demoUser}" (Target: 14 days, 1.5 hrs/day).`);

    console.log('\n=============================================');
    console.log('🎉 TutaPass Database Seeding Completed Successfully!');
    console.log('=============================================');
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();

