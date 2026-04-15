# Developer Notes

## 4/6/2026

I find that I'm using both my skills as a developer and a documentarian to ensure the code and documentation are clear and have good quality. As Claude noted in the contributing file, it's important to check the code for hallucinations, quality, and conciseness. When told to check its own code for this, it often finds errors. But having it do this in an endless cycle (write the code, check the code) won’t work because it can’t catch its own errors.

There has been discussion of there being a benefit to have Claude (or whatever) do its work which frees the user to go over and do other tasks. But this feels very much like pretty bad context switching. As a developer, this feels like an antipattern and not a best practice because I’ve noticed it makes me distracted and less likely to have a good attention to detail as the code is being created.

Instead, I’ve been using the time that Claude has been working to check its code. It also means that I have a running list of questions related to its code choices, code quality, attention to detail, etc. 

I’ve been asking it questions about its choices, which often requires it to correct itself. This still feels like leading a junior developer though a pair programming exercise. Not a bad experience, but less helpful to free me up to innovate. The way AI has been pitched for this, it’s supposed to free us up to think up new ideas, not babysit. But I’m still in babysit mode because of its propensity to make errors. 

I honestly don’t know if I’m doing this right, but it feels like if I were just to let Claude do its thing, the code quality would be really shabby. 

It’s really important to keep the architecture/purpose of the app in my head as I’m looking at its code. It often misses the point and makes weird assumptions.

It also really struggles with scopes in the manifest. This might indicate that this documentation can be improved for searchability.

## 4.15.2026
It feels like there’s a creep away from what I tell it to do day to day. I don’t know if I need to be explicitly telling it to perform actions every day (e.g. today it forgot it had permission to write to the changelog and it’s long since forgotten to use the input needed sound I had it use but it still does the task completed sound). It feels like this might be a maintenance thing? But also maybe I’m doing it wrong.

Because I’m not doing the PR/code myself, I’m finding it a bit hard to orient toward what I want to do with it. This might be because I”m used to thinking in the code level and not the architecture level but also it’s irritating because I feel like I’m making mistakes too.

Also stuff that’s natural for me (e.g. always code on a new branch) isn’t for it, so I have to keep reminding it and myself to have these best practices. Is this a scenario where I could use a script?

I know all of these issues would be ameliorated by using Claude scripts. But as a beginner user just poking around with this technology, I don’t know where I would get them. 

Question of the day: When using AI how can you tell if the problem exists between chair and keyboard?

Note: I’m using Slack’s acct, which means I have unlimited spend on tokens. b/c of this, I haven’t been very conscious of that

Next up: finish this repo’s MVP, then create a new one with Claude using and refining scripts
