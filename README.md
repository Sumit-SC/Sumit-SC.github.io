(Updating README: appending Giscus/FormSubmit setup instructions)

Minimal Portfolio Site for Sumit

This repository branch `portfolio-site` contains a lightweight portfolio site meant for use on GitHub Pages. It is built with plain HTML, CSS, and minimal vanilla JavaScript — no frameworks, no build step.

... (existing content remains) ...

Giscus (GitHub Discussions) integration
- The project detail pages embed Giscus to provide a native, professional comment experience backed by GitHub Discussions.
- I pre-filled the numeric repository id in the embed (REPO_ID = 742705089). You still need to create a Discussion category and get its numeric id to enable posting.

Steps to enable Giscus fully:
1. In your repository Settings → Features, enable Discussions (if not already enabled).
2. Open the Discussions tab and create a category named e.g. "Project Comments" (or any name).
3. To get the category numeric id:
   - Option A (recommended): use the GraphQL API or a browser extension. Example GraphQL query (requires a GitHub token):
     {
       repository(owner:"Sumit-SC", name:"Sumit-SC.github.io") { discussionCategory(id: "CATEGORY_NODE_ID") { id }
       }
     }
   - Option B: Create one Discussion manually, then use the network inspector to find the category id when creating a discussion (the UI includes numeric ids in some endpoints).
4. Replace the placeholder CATEGORY_ID_PLACEHOLDER in assets/js/main.js (variable GISCUS_CATEGORY_ID_PLACEHOLDER) with the numeric category id (a long number).
5. Giscus will map each project by the project.id value so each project gets its own Discussion thread.

Anonymous feedback via FormSubmit
- The project pages also include an anonymous form UI (local-only by default). To receive submissions by email, configure FormSubmit:
  - Go to https://formsubmit.co/ and follow their instructions to get an endpoint like https://formsubmit.co/your-email
  - Replace the placeholder email URLs in contact.html and project anonymous UI (when you update) with your FormSubmit endpoint.

Note on anonymous comments
- For privacy and simplicity, anonymous posts are stored in the visitor's browser localStorage so the submitter sees their posts again. Other visitors will not see those posts unless you implement a backend to aggregate them (options: Staticman, a GitHub Action that appends to data/comments.json, or a small server endpoint).

Contact page
- Includes a cBox placeholder for live chat and a FormSubmit-based anonymous feedback form. Replace the cBox embed in contact.html if you want a live chat.

Publishing
- Push and set GitHub Pages to use the portfolio-site branch (Settings → Pages → branch: portfolio-site / root). Do NOT merge to main unless you want to replace the live site.

If you'd like, I can now replace CATEGORY_ID_PLACEHOLDER with the actual category id if you create the category and provide the id, or I can leave it for you to paste later.

--- End of update
