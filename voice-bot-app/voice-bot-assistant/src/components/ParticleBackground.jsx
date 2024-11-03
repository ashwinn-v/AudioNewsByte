

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-white rounded-full opacity-70 particle"
          style={{
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `particle ${10 + Math.random() * 20}s linear infinite`
          }}
        />
      ))}
    </div>
  );
};

export default ParticleBackground;
