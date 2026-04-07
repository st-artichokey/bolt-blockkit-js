# Developer Notes

## 4/6/2026

I find that I'm using both my skills as a developer and a documentarian to ensure the code and documentation are clear and have good quality. As Claude noted in the contributing file, it's important to check the code for hallucinations, quality, and conciseness. When told to check its own code for this, it often finds errors. But having it do this in an endless cycle (write the code, check the code) won’t work because it can’t catch its own errors.

There has been discussion of there being a benefit to have Claude (or whatever) do its work which frees the user to go over and do other tasks. But this feels very much like pretty bad context switching. As a developer, this feels like an antipattern and not a best practice because I’ve noticed it makes me distracted and less likely to have a good attention to detail as the code is being created.

Instead, I’ve been using the time that Claude has been working to check its code. It also means that I have a running list of questions related to its code choices, code quality, attention to detail, etc. 

I’ve been asking it questions about its choices, which often requires it to correct itself. This still feels like leading a junior developer though a pair programming exercise. Not a bad experience, but less helpful to free me up to innovate. The way AI has been pitched for this, it’s supposed to free us up to think up new ideas, not babysit. But I’m still in babysit mode because of its propensity to make errors. 

I honestly don’t know if I’m doing this right, but it feels like if I were just to let Claude do its thing, the code quality would be really shabby. 

It’s really important to keep the architecture/purpose of the app in my head as I’m looking at its code. It often misses the point and makes weird assumptions.

It also really struggles with scopes in the manifest. This might indicate that this documentation can be improved for searchability.
