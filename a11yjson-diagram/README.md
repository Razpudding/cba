# A11yjson diagram
Figuring out the hierarchy of the A11yJSON interfaces was (and is) a bit of a struggle. So I'll try to visually reflect the nesting of the interfaces here.

## Example mermaid diagram
```mermaid
classDiagram
      Animal <|-- Duck
      Animal <|-- Fish
      Animal <|-- Zebra
      Animal : +int age
      Animal : +String gender
      Animal: +isMammal()
      Animal: +mate()
      class Duck{
          +String beakColor
          +swim()
          +quack()
      }
      class Fish{
          -int sizeInFeet
          -canEat()
      }
      class Zebra{
          +bool is_wild
          +run()
      }
```

[Mermaid docs](https://mermaid-js.github.io/mermaid/#/)
Alternatively it's possible to [integrate draw.io](https://drawio.freshdesk.com/support/solutions/articles/16000042371-embed-a-diagram-in-github-markdown) in github